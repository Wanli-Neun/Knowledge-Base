terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  # AWS credentials sẽ được lấy từ:
  # 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  # 2. AWS credentials file (~/.aws/credentials)
  # 3. IAM role (nếu chạy trên EC2)
}

# Data source để tham chiếu bucket S3 hiện có
data "aws_s3_bucket" "existing_file_storage" {
  bucket = "${var.project_name}-${var.environment}"
}

# Hoặc nếu muốn Terraform quản lý bucket hiện có, uncomment và chạy terraform import:
# resource "aws_s3_bucket" "file_storage" {
#   bucket = "${var.project_name}-${var.environment}"
#
#   tags = {
#     Name        = "File Storage Bucket"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }

# Bucket S3 CHO VIỆC LƯU NỘI DUNG FILE ĐÃ XỬ LÝ (Bucket mới)
resource "aws_s3_bucket" "file_content_storage" {
  bucket = "${var.project_name}-content-${var.environment}"

  tags = {
    Name        = "File Content Storage Bucket"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Nếu muốn enable versioning cho bucket hiện có (uncomment sau khi import):
# resource "aws_s3_bucket_versioning" "file_storage_versioning" {
#   bucket = aws_s3_bucket.file_storage.id
#
#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# Versioning cho bucket file content storage
resource "aws_s3_bucket_versioning" "file_content_storage_versioning" {
  bucket = aws_s3_bucket.file_content_storage.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Nếu muốn enable encryption cho bucket hiện có (uncomment sau khi import):
# resource "aws_s3_bucket_server_side_encryption_configuration" "file_storage_encryption" {
#   bucket = aws_s3_bucket.file_storage.id
#
#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }

# Encryption cho bucket file content storage
resource "aws_s3_bucket_server_side_encryption_configuration" "file_content_storage_encryption" {
  bucket = aws_s3_bucket.file_content_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Nếu muốn quản lý public access cho bucket hiện có (uncomment sau khi import):
# resource "aws_s3_bucket_public_access_block" "file_storage_public_access" {
#   bucket = aws_s3_bucket.file_storage.id
#
#   block_public_acls       = true
#   block_public_policy     = true
#   ignore_public_acls      = true
#   restrict_public_buckets = true
# }

# Block public access cho bucket file content storage
resource "aws_s3_bucket_public_access_block" "file_content_storage_public_access" {
  bucket = aws_s3_bucket.file_content_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rule cho bucket file content storage (optional - auto cleanup)
resource "aws_s3_bucket_lifecycle_configuration" "file_content_storage_lifecycle" {
  bucket = aws_s3_bucket.file_content_storage.id

  rule {
    id     = "cleanup-old-content"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 180
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# Nếu muốn cấu hình CORS cho bucket hiện có (uncomment sau khi import):
# resource "aws_s3_bucket_cors_configuration" "file_storage_cors" {
#   bucket = aws_s3_bucket.file_storage.id
#
#   cors_rule {
#     allowed_headers = ["*"]
#     allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
#     allowed_origins = var.allowed_origins
#     expose_headers  = ["ETag"]
#     max_age_seconds = 3000
#   }
# }

# CORS configuration cho bucket file content storage
resource "aws_s3_bucket_cors_configuration" "file_content_storage_cors" {
  bucket = aws_s3_bucket.file_content_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
