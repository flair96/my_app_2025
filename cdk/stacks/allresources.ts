// CDK Template for Deploying the Architecture
// Assumes: CDK v2, TypeScript
// Deploys ECS Fargate services for Auth and Main App, Lambda for Cleanup, RDS PostgreSQL, and Amazon Keyspaces

import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class DevOpsAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'AppVPC', { maxAzs: 2 });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'AppCluster', { vpc });

    // RDS PostgreSQL
    const dbCredentials = new secretsmanager.Secret(this, 'DbCredentials', {
      secretName: 'auth-postgres-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        generateStringKey: 'password',
      },
    });

    const postgres = new rds.DatabaseInstance(this, 'PostgresDB', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.V14 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromSecret(dbCredentials),
      multiAz: true,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: false,
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ECS Fargate Task Definitions (Auth and Main App)
    const authTaskDef = new ecs.FargateTaskDefinition(this, 'AuthTaskDef');
    authTaskDef.addContainer('AuthContainer', {
      image: ecs.ContainerImage.fromRegistry('your-auth-ecr-repo'),
      memoryLimitMiB: 512,
      cpu: 256,
      environment: {
        DB_HOST: postgres.dbInstanceEndpointAddress,
      },
    });

    const mainTaskDef = new ecs.FargateTaskDefinition(this, 'MainAppTaskDef');
    mainTaskDef.addContainer('MainAppContainer', {
      image: ecs.ContainerImage.fromRegistry('your-mainapp-ecr-repo'),
      memoryLimitMiB: 512,
      cpu: 256,
      environment: {
        CASSANDRA_CONTACT_POINTS: 'your-keyspaces-endpoint',
      },
    });

    // ECS Services
    new ecs.FargateService(this, 'AuthService', {
      cluster,
      taskDefinition: authTaskDef,
      desiredCount: 2,
    });

    new ecs.FargateService(this, 'MainAppService', {
      cluster,
      taskDefinition: mainTaskDef,
      desiredCount: 2,
    });

    // Lambda for Cleanup Job
    const cleanupLambda = new lambda.Function(this, 'CleanupJob', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'), // folder containing cleanup.py
      handler: 'cleanup.handler',
      timeout: Duration.minutes(5),
      environment: {
        CASSANDRA_CONTACT_POINTS: 'your-keyspaces-endpoint',
      },
    });

    // EventBridge Rule to trigger cleanup job daily
    new events.Rule(this, 'DailyCleanupSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '0' }),
      targets: [new targets.LambdaFunction(cleanupLambda)],
    });
  }
}
