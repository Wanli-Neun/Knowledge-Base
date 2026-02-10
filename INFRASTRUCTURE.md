# Infrastructure Inventory - Knowledge Base Project

> **Single Source of Documentation** cho tất cả infrastructure resources

Last Updated: 2026-02-10  
Infrastructure Management: **Terraform** (Primary)

---

## 🎯 Centralized Management Strategy

```
┌───────────────────────────────────────────────────────┐
│         INFRASTRUCTURE.md (Master Index)              │
│         ↓  Single source of truth                     │
└─────────────────────┬─────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌────────────┐
│  TERRAFORM   │ │  MANUAL  │ │  FUTURE    │
│  (Primary)   │ │ (Legacy) │ │  (Planed)  │
│              │ │          │ │            │
│ • S3 new    │ │ • S3 old │ │ • RDS      │
│ • Future    │ │          │ │ • VPC      │
│   resources │ │          │ │ • Lambda   │
└──────────────┘ └──────────┘ └────────────┘

     Managed          Reference      Will add
     via Code         only           to Terraform
```

**Philosophy:** Tập trung quản lý theo tool → Document tất cả ở 1 nơi

---

## 🎯 Management Overview

| Resource Type        | Management Tool            | Location                               | Status               |
| -------------------- | -------------------------- | -------------------------------------- | -------------------- |
| **AWS S3 Buckets**   | Terraform                  | [terraform/main.tf](terraform/main.tf) | ✅ IaC Ready         |
| S3 Bucket (legacy)   | Manual → Terraform planned | Documented below                       | ⚠️ Migration planned |
| Auth Service (BE)    | Manual deployment          | [auth-service/](auth-service/)         | 📦 Application       |
| Project Service (BE) | Manual deployment          | [project-service/](project-service/)   | 📦 Application       |
| Frontend (FE)        | Manual deployment          | [web/](web/)                           | 📦 Application       |
| Future AWS Resources | Terraform                  | [terraform/](terraform/)               | 🔮 Planned via IaC   |

---

## 📦 AWS Infrastructure (Terraform)

> **Centralized IaC:** Tất cả AWS resources được quản lý tập trung tại [terraform/](terraform/)

### **Current Resources**

#### ✅ Terraform-Managed (Active)

| Resource Type | Name/ID                                 | Purpose                    | Created    | Config File                         |
| ------------- | --------------------------------------- | -------------------------- | ---------- | ----------------------------------- |
| **S3 Bucket** | `project-service-documents-content-dev` | Lưu nội dung file đã xử lý | 2026-02-10 | [main.tf:35](terraform/main.tf#L35) |

**Cấu hình đầy đủ:**

- ✅ Versioning enabled
- ✅ Server-side encryption (AES256)
- ✅ Block public access
- ✅ CORS configuration (Frontend domain)
- ✅ Lifecycle policy (90d→IA, 180d→Glacier, 365d→Delete)

**Thao tác:**

```bash
cd terraform
terraform plan    # Xem thay đổi
terraform apply   # Áp dụng thay đổi
```

---

#### ⚠️ Legacy Resources (Referenced Only)

| Resource Type | Name/ID                         | Purpose             | Managed By           | Migration Plan                  |
| ------------- | ------------------------------- | ------------------- | -------------------- | ------------------------------- |
| **S3 Bucket** | `project-service-documents-dev` | Lưu file gốc upload | Manual (AWS Console) | Import to Terraform when stable |

**Terraform reference:**

```hcl
# terraform/main.tf line 19
data "aws_s3_bucket" "existing_file_storage"
```

**Thao tác:** AWS Console > S3 > `project-service-documents-dev`

---

### **Planned Resources (Future)**

| Resource Type | Purpose | Priority | Planned Date |
|---� Application Layer (Non-IaC)

> **Application code** - Deployed manually, infrastructure sẽ được Terraform quản lý sau

### **Backend Services (Spring Boot)**

| Service             | Port | Tech Stack                    | Deployment     | Location                             |
| ------------------- | ---- | ----------------------------- | -------------- | ------------------------------------ |
| **auth-service**    | 8081 | Java 17 + Spring Boot + Maven | Manual (local) | [auth-service/](auth-service/)       |
| **project-service** | 8082 | Java 17 + Spring Boot + Maven | Manual (local) | [project-service/](project-service/) |

**Current deployment:**

```bash
# Local development
cd auth-service && mvn spring-boot:run
cd project-service && mvn spring-boot:run
```

**S3 Integration:**

```properties
# application.properties
aws.s3.file-bucket=project-service-documents-dev
aws.s3.content-bucket=project-service-documents-content-dev
```

**Future migration:**

- [ ] Containerize với Docker
- [ ] Deploy lên AWS ECS/Fargate (via Terraform)
- [ ] Load balancer + Auto scaling (via Terraform)

---

### **Frontend (Next.js)**

| Environment | URL                   | Deployment    | Location     |
| ----------- | --------------------- | ------------- | ------------ |
| Development | http://localhost:3000 | `npm run dev` | [web/](web/) |
| Production  | TBD                   | TBD           | [web/](web/) |

**S3 Access:**

- CORS configured for `localhost:3000` in Terraform
- Production domain cần add vào [terraform/terraform.tfvars](terraform/terraform.tfvars)
  & Third-party Services

> Services nằm ngoài AWS/Terraform control

### **Domain & DNS**

| Service | Provider | Status            | Notes                                    |
| ------- | -------- | ----------------- | ---------------------------------------- |
| Domain  | TBD      | 🔜 Not configured | Plan: Register domain → Add to Terraform |
| DNS     | TBD      | 🔜 Not configured | Plan: AWS Route53 (via Terraform)        |

---

### **Monitoring & Logging**

| Service          | Provider | Status            | Plan                                    |
| ---------------- | -------- | ----------------- | --------------------------------------- |
| Application logs | Local    | ⚠️ Manual         | Migrate to CloudWatch (Terraform)       |
| Metrics          | None     | ❌ Not configured | Add CloudWatch Metrics (Terraform)      |
| Alerts           | None     | ❌ Not configured | Add SNS + CloudWatch Alarms (Terraform) |

---

### **Security & Secrets**

| Type            | Current Storage          | Status       | Future Plan                      |
| --------------- | ------------------------ | ------------ | -------------------------------- |
| AWS Credentials | `~/.aws/credentials`     | ⚠️ Local     | Keep for dev, IAM roles for prod |
| DB Passwords    | `application.properties` | ⚠️ Hardcoded | AWS Secrets Manager (Terraform)  |
| API Keys        | `.env` files             | ⚠️ Local     | AWS Secrets Manager (Terraform)  |

⚠️ \*�️ Infrastructure Roadmap

> **Strategy:** Tập trung quản lý tất cả AWS resources qua Terraform

### **✅ Phase 1: Foundation (Current - Q1 2026)**

- [x] Terraform setup & structure
- [x] S3 bucket cho file content (Terraform managed)
- [x] Reference legacy S3 bucket
- [x] Infrastructure documentation
- [x] CORS configuration cho Frontend

**Status:** ✅ Complete

---

### **🔄 Phase 2: Database & Storage (Q2 2026)**

- [ ] **RDS PostgreSQL** (Terraform) - Database cho services
- [ ] **S3 lifecycle policies** optimization
- [ ] **Import legacy S3 bucket** vào Terraform (khi production stable)
- [ ] **VPC + Security Groups** (Terraform) - Network isolation

**Goal:** Tất cả data layer managed by Terraform

---

### **🚀 Phase 3: Application Infrastructure (Q3 2026)**

- [ ] **ECS Fargate** (Terraform) - Container orchestration
- [ ] **Application Load Balancer** (Terraform)
- [ ] **CloudWatch Logs & Metrics** (Terraform)
- [ ] **Secrets Manager** (Terraform) - Centralized secrets
- [ ] **Lambda functions** (Terraform) - Serverless processing

**Goal:** Containerized apps với full infrastructure as code

---

### **🏭 Phase 4: Production Ready (Q4 2026)**

- [ ] **CloudFront CDN** (Terraform) - Frontend delivery
- [ ] **Route53** (Terraform) - DNS management
- [ ] **SNS + CloudWatch Alarms** (Terraform) - Monitoring & alerts
- [ ] **AWS Backup** (Terraform) - Automated backups
- [ ] **CI/CD pipeline** - Automated deployments
- [ ] **Multi-environment** (dev/staging/prod) via Terraform workspaces

\*\*GoalQuick Reference Guide

### "Tôi cần làm gì với resource X?"

| Task                           | Tool/Location     | Action                                                                                                |
| ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Thay đổi S3 bucket mới**     | Terraform         | Edit [terraform/main.tf](terraform/main.tf) → `terraform apply`                                       |
| **Xem S3 bucket cũ**           | AWS Console       | S3 > `project-service-documents-dev`                                                                  |
| **Thêm AWS resource mới**      | Terraform         | Add to [terraform/main.tf](terraform/main.tf) → `terraform apply`                                     |
| **Config backend service**     | Spring properties | Edit [auth-service/...application.properties](auth-service/src/main/resources/application.properties) |
| **Deploy backend**             | Manual            | `cd {service} && mvn spring-boot:run`                                                                 |
| **Config frontend**            | Next.js env       | Edit [web/.env.local](web/)                                                                           |
| **Deploy frontend**            | Manual            | `cd web && npm run dev`                                                                               |
| **Xem toàn bộ infrastructure** | Documentation     | Read [INFRASTRUCTURE.md](INFRASTRUCTURE.md) (file này)                                                |

---

## 📁 Project Structure - Centralized Management

````
d:\Knowledge-Base\
│
├── 📄 INFRASTRUCTURE.md          ← ⭐ BẠN ĐANG Ở ĐÂY - Master index
├── 📄 README.md                   ← Project overview
│
├── 🏗️ terraform/                  ← ⭐ TERRAFORM - AWS Infrastructure (IaC)
│   ├── main.tf                   ← Resource definitions
│   ├── variables.tf              ← Input variables
│   ├── outputs.tf                ← Output values
│   ├── terraform.tfvars          ← Actual values (not in git)
│   ├── README.md                 ← Terraform guide
│   ├── DEPLOY.mProcedures

### 🔥 Disaster Recovery - Restore AWS Infrastructure
```bash
# 1. Clone repository
git clone <your-repo-url>
cd Knowledge-Base
Infrastructure Change Log

> Track tất cả infrastructure changes tại đây

| Date | Resource | Change | Tool | Commit |
|------|----------|--------|------|--------|
| 2026-02-10 | Documentation | Created INFRASTRUCTURE.md for centralized management | Manual | - |
| 2026-02-10 | S3 Bucket | Created `project-service-documents-content-dev` | Terraform | [View](terraform/main.tf#L35) |
| 2026-02-10 | Terraform | Initial setup với variables, outputs, lifecycle | Terraform | [View](terraform/) |

**Next updates:**
- RDS database setup (planned Q2 2026)
- VPC network configuration (planned Q2 2026)

# 4. Restore infrastructure
cd terraform
terraform init
terraform plan    # Verify changes
terraform apply   # Restore resources
````

### ⏪ Rollback Infrastructure Changes

```bash
# 1. Find problematic commit
git log -- terraform/

# 2. Revert to previous version
git revert <commit-hash>

# 3. Apply previous configuration
cd terraform
terraform plan
terraform apply
```

### 🔍 Debug Infrastructure Issues

```bash
# Check current state
terraform show

# Validate configuration
terraform validate

# Refresh state from AWS
terraform refresh

# Check drift (manual changes)
terraform plan -refresh-onlocal                ← Environment variables
    └── app/                      ← Application code
```

**📌 Management Strategy:**

- **AWS Resources** → Tập trung trong `terraform/`
- **Application Code** → Riêng từng service folder
- **Documentation** → `INFRASTRUCTURE.md` + `terraform/README.md`

### **Phase 1: Current (Q1 2026)** ✅

- [x] Create Terraform setup
- [x] Manage new S3 bucket via Terraform
- [x] Document existing infrastructure

### **Phase 2: Containerization (Q2 2026)**

- [ ] Dockerize auth-service
- [ ] Dockerize project-service
- [ ] Create docker-compose.yml
- [ ] Add to Terraform (ECS/Fargate)

### **Phase 3: Full IaC (Q3 2026)**

- [ ] Import legacy S3 bucket to Terraform
- [ ] Add RDS via Terraform
- [ ] Add networking (VPC/Subnets) via Terraform
- [ ] Migrate secrets to AWS Secrets Manager

### **Phase 4: Production Ready (Q4 2026)**

- [ ] CI/CD pipeline via Terraform
- [ ] Monitoring & Logging infrastructure
- [ ] Backup & Disaster Recovery setup
- [ ] Production deployment

---

## 🔍 Resource Lookup Guide

### "Tôi cần thay đổi X, phải làm gì?"

| Resource                | Action             | Where to Look                                                                                                    |
| ----------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| S3 bucket content       | Edit Terraform     | [terraform/main.tf](terraform/main.tf)                                                                           |
| S3 bucket file (legacy) | AWS Console        | S3 > project-service-documents-dev                                                                               |
| Auth service config     | Edit Spring config | [auth-service/src/main/resources/application.properties](auth-service/src/main/resources/application.properties) |
| Frontend UI             | Edit Next.js       | [web/app/](web/app/)                                                                                             |
| Add new AWS resource    | Add to Terraform   | [terraform/main.tf](terraform/main.tf)                                                                           |

---

## 👥 Team Access

| Team Member | AWS Access | Terraform | GitHub | Notes             |
| ----------- | ---------- | --------- | ------ | ----------------- |
| -           | -          | -         | -      | Update this table |

---

## 📝 Change Log

| Date       | Change                           | By     | Tool          |
| ---------- | -------------------------------- | ------ | ------------- |
| 2026-02-10 | Added S3 content bucket          | System | Terraform     |
| 2026-02-10 | Created infrastructure inventory | System | Documentation |

---

## 🆘 Emergency Contacts & Runbooks

### Disaster Recovery

```bash
# Restore infrastructure from code
git clone <repo>
cd terraform
terraform init
terraform apply -var-file="prod.tfvars"
```

### Rollback Procedure

```bash
# Terraform rollback
git revert <commit-hash>
terraform apply
```

---

## 📚 Related Documentation

- [Terraform Guide](terraform/README.md)
- [Project README](README.md)

---

**Ownership:** Infrastructure Team  
**Review Frequency:** Monthly  
**Next Review:** 2026-03-10
