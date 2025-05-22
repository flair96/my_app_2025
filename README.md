# darktrace_app
Infrastructure-as-Code for a secure, scalable microservices architecture on AWS using ECS Fargate, Lambda, RDS, and Keyspaces. Includes CI/CD and IaC with AWS CDK (TypeScript).


# 🛠️ Cloud Microservices Architecture with AWS CDK

This project defines a secure, highly available, and scalable cloud architecture for a microservices-based application using **AWS CDK (TypeScript)**.

## 🚀 Overview

The system consists of three core components:

1. **Auth Service** (Java)  
   - Handles authentication and authorization  
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

## 📁 Project Structure
.
├── cdk/ # CDK Infrastructure (TypeScript)
│ └── stacks/
│ └── DevOpsAppStack.ts
├── lambda/ # Python script for Cleanup Job
│ └── cleanup.py
├── README.md
├── package.json
└── tsconfig.json




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


