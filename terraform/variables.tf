variable "aws_region" {
  description = "AWS region cho việc triển khai resources"
  type        = string
  default     = "ap-southeast-1"  # Singapore region
}

variable "project_name" {
  description = "Tên project, sử dụng làm prefix cho bucket names"
  type        = string
  default     = "knowledge-base"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "allowed_origins" {
  description = "Danh sách origins được phép truy cập S3 buckets (CORS) - CHỈ cần Frontend domain vì CORS chỉ áp dụng cho browser requests. Backend services gọi S3 trực tiếp không cần CORS."
  type        = list(string)
  default     = ["http://localhost:3000", "https://yourdomain.com"]
}
