# darktrace_app
Infrastructure-as-Code for a secure, scalable microservices architecture on AWS using ECS Fargate, Lambda, RDS, and Keyspaces. Includes CI/CD and IaC with AWS CDK (TypeScript).


# 🛠️ Cloud Microservices Architecture with AWS CDK

This project defines a secure, highly available, and scalable cloud architecture for a microservices-based application using **AWS CDK (TypeScript)**.

## 🚀 Overview

The system consists of three core components:

1. **Auth Service** (Java)  
   - Handles authentication and authorisation  
   - Deployed to ECS Fargate  
   - Connected to PostgreSQL (Amazon RDS)

2. **Main Application** (NodeJS/TypeScript)  
   - Receives periodic requests from a mobile app  
   - Deployed to ECS Fargate  
   - Interacts with Amazon Keyspaces (Cassandra)

3. **Cleanup Job** (Python)  
   - Periodic background job for archiving old data  
   - Deployed via AWS Lambda  
   - Triggered by EventBridge (daily)

---

## 📦 Architecture Diagram

![Architecture Diagram](./docs/architecture.png)

---

## 🧱 Services Used

- **Amazon ECS Fargate**
- **Amazon RDS for PostgreSQL**
- **Amazon Keyspaces (for Cassandra)**
- **AWS Lambda**
- **Amazon EventBridge**
- **AWS Secrets Manager**
- **Amazon VPC, IAM, CloudWatch**

---

## 🔐 Security Features

- Private subnets for ECS and DBs
- IAM Roles with least privilege
- Secrets stored in AWS Secrets Manager
- TLS for all services
- CloudTrail and CloudWatch logging

---

## 📦 Deployment Instructions

### ✅ Prerequisites

- AWS CLI configured
- Node.js (v16+)
- AWS CDK v2
- Docker (for container image packaging)
- AWS ECR repositories created

### 🛠️ Deploy

```bash
# Install dependencies
npm install

# Bootstrap CDK
cdk bootstrap

# Deploy the stack
cdk deploy



Future Considerations
🔐 Security Improvements
1. Private Networking (VPC Best Practices)
Deploy all ECS services, Lambda, RDS, and Keyspaces inside private subnets.

Use NAT Gateway only if outbound internet access is needed.

Use VPC Endpoints for:

Secrets Manager

S3 (if Lambda fetches artifacts)

Amazon Keyspaces (via PrivateLink)

✅ Why: Prevents public access and reduces attack surface.

2. API Security
Use WAF (Web Application Firewall) in front of API Gateway or ALB.

Implement rate limiting and IP whitelisting (if applicable).

JWT validation in Auth Service, with expiration & signature checks.

Use API keys or usage plans for third-party integrations.

✅ Why: Protects from abuse and injection attacks.

3. Secret Management
Use AWS Secrets Manager to:

Store DB creds and rotate them automatically.

Access them via IAM roles (no plaintext env vars).

Ensure KMS encryption is enabled for all secrets.

✅ Why: Avoids hardcoded credentials and allows centralized audit/control.

4. IAM Roles & Least Privilege
Create separate IAM roles for:

Auth ECS task

Main App ECS task

Lambda function

Each role should only have permissions needed (e.g., RDS access only for Auth service).

✅ Why: Containment in case of compromise.

5. Data Encryption
Enable encryption at rest:

RDS: With AWS-managed KMS keys

Keyspaces: Automatically encrypted

Encrypt all in-transit data:

Use HTTPS with TLS 1.2+ everywhere

✅ Why: Complies with data protection standards (e.g., GDPR, HIPAA)

🔄 Resilience & Operational Improvements
6. Health Checks & Auto Recovery
Add application-level health checks (e.g., /health) to ECS services.

ECS + ALB auto-restart unhealthy containers.

RDS: Multi-AZ failover; consider read replica for scale-out reads.

7. Monitoring, Alerting, Logging
Use CloudWatch Logs for ECS & Lambda output.

Set up CloudWatch Alarms for:

High error rates

High latency

Task failures

Send alerts via SNS or Slack webhook.

Consider AWS X-Ray for distributed tracing.

✅ Why: Faster detection & resolution of issues.

8. Audit Logging
Enable AWS CloudTrail across all regions.

Track:

IAM role usage

Secrets access

ECS deployments

✅ Why: Required for compliance and incident response.

9. Secure Deployment Practices
Use CodePipeline/CodeBuild with approvals before production deploys.

Digitally sign Docker images and Lambda packages.

Use image scanning tools like:

Amazon Inspector

Snyk or Trivy

✅ Why: Prevents deploying vulnerable or tampered code.
