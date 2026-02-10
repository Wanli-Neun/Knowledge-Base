output "file_storage_bucket_name" {
  description = "Tên bucket S3 cho file storage (bucket hiện có)"
  value       = data.aws_s3_bucket.existing_file_storage.id
}

output "file_storage_bucket_arn" {
  description = "ARN của bucket S3 cho file storage (bucket hiện có)"
  value       = data.aws_s3_bucket.existing_file_storage.arn
}

output "file_storage_bucket_region" {
  description = "Region của bucket S3 cho file storage (bucket hiện có)"
  value       = data.aws_s3_bucket.existing_file_storage.region
}

output "file_content_storage_bucket_name" {
  description = "Tên bucket S3 cho file content storage"
  value       = aws_s3_bucket.file_content_storage.id
}

output "file_content_storage_bucket_arn" {
  description = "ARN của bucket S3 cho file content storage"
  value       = aws_s3_bucket.file_content_storage.arn
}

output "file_content_storage_bucket_region" {
  description = "Region của bucket S3 cho file content storage"
  value       = aws_s3_bucket.file_content_storage.region
}
