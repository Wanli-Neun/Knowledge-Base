# Terraform Configuration cho Knowledge Base S3 Buckets

## Mô tả

Cấu hình Terraform này tạo 2 S3 buckets:

1. **File Storage Bucket**: Lưu trữ file gốc được upload
2. **File Content Storage Bucket**: Lưu trữ nội dung đã được xử lý từ file

## Tính năng

### Cả 2 buckets đều có:

- ✅ Versioning enabled
- ✅ Server-side encryption (AES256)
- ✅ Block all public access
- ✅ CORS configuration cho web access
- ✅ Tags để quản lý

### File Content Storage Bucket có thêm:

- ✅ Lifecycle policy tự động:
  - Sau 90 ngày: chuyển sang STANDARD_IA (tiết kiệm chi phí)
  - Sau 180 ngày: chuyển sang GLACIER (lưu trữ lâu dài)
  - Sau 365 ngày: tự động xóa

## Các bước triển khai

### 1. Cài đặt Terraform

```bash
# Download từ: https://www.terraform.io/downloads
# Hoặc dùng chocolatey trên Windows:
choco install terraform
```

### 2. Cấu hình AWS Credentials

```bash
# Thiết lập AWS credentials
aws configure

# Hoặc export environment variables:
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set AWS_DEFAULT_REGION=ap-southeast-1
```

### 3. Tạo file terraform.tfvars

```bash
# Copy file example
cp terraform.tfvars.example terraform.tfvars

# Chỉnh sửa terraform.tfvars với thông tin của bạn
```

### 4. Khởi tạo và triển khai

```bash
# Di chuyển vào thư mục terraform
cd terraform

# Khởi tạo Terraform
terraform init

# Kiểm tra plan
terraform plan

# Apply để tạo resources
terraform apply
```

### 5. Lấy thông tin buckets

```bash
# Xem output
terraform output

# Hoặc xem specific output
terraform output file_storage_bucket_name
terraform output file_content_storage_bucket_name
```

## Cấu trúc File

```
terraform/
├── main.tf                    # Định nghĩa resources chính
├── variables.tf               # Khai báo variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example configuration
├── .gitignore                 # Ignore sensitive files
└── README.md                  # Documentation
```

## Variables

| Variable          | Description                    | Default                     |
| ----------------- | ------------------------------ | --------------------------- |
| `aws_region`      | AWS region                     | `ap-southeast-1`            |
| `project_name`    | Project name prefix            | `knowledge-base`            |
| `environment`     | Environment (dev/staging/prod) | `dev`                       |
| `allowed_origins` | CORS allowed origins           | `["http://localhost:3000"]` |

## Outputs

- `file_storage_bucket_name`: Tên bucket lưu file
- `file_storage_bucket_arn`: ARN của bucket lưu file
- `file_content_storage_bucket_name`: Tên bucket lưu content
- `file_content_storage_bucket_arn`: ARN của bucket lưu content

## Sử dụng trong ứng dụng

### Java (Spring Boot)

Thêm vào `application.properties`:

```properties
# File Storage Bucket
aws.s3.file-storage-bucket=${FILE_STORAGE_BUCKET_NAME}

# File Content Storage Bucket
aws.s3.file-content-bucket=${FILE_CONTENT_STORAGE_BUCKET_NAME}

aws.region=ap-southeast-1
```

### Next.js

Thêm vào `.env.local`:

```env
AWS_REGION=ap-southeast-1
AWS_S3_FILE_STORAGE_BUCKET=your-file-storage-bucket-name
AWS_S3_FILE_CONTENT_BUCKET=your-file-content-bucket-name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Quản lý

### Xem trạng thái

```bash
terraform show
```

### Cập nhật resources

```bash
# Chỉnh sửa file .tf
# Sau đó apply lại
terraform apply
```

### Xóa resources

```bash
terraform destroy
```

## Lưu ý bảo mật

- ⚠️ **KHÔNG** commit file `terraform.tfvars` vào git
- ⚠️ **KHÔNG** commit file `.tfstate` vào git
- ✅ Sử dụng S3 backend để lưu state file cho production
- ✅ Sử dụng AWS IAM roles thay vì hardcode credentials
- ✅ Enable MFA cho AWS account

## Tối ưu chi phí

File Content Storage Bucket đã được cấu hình lifecycle để tối ưu chi phí:

- Dữ liệu ít truy cập sẽ tự động chuyển sang storage class rẻ hơn
- Dữ liệu cũ (>365 ngày) sẽ tự động xóa

Bạn có thể điều chỉnh thời gian trong file `main.tf` nếu cần.

## Support

Nếu gặp vấn đề, kiểm tra:

1. AWS credentials đã được cấu hình chưa
2. IAM user có đủ quyền tạo S3 bucket chưa
3. Bucket name có bị trùng không (S3 bucket names phải unique globally)
