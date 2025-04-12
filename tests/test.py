import boto3
from botocore.client import Config

# MinIO server config
minio_config = {
    "endpoint_url": "http://localhost:9000",  # Ensure this is HTTP
    "aws_access_key_id": "xSLwwLYcfrf4atzCSXXz",
    "aws_secret_access_key": "UTWLrQsNN3V7Jmm6NVjIWGoCC2Gw4PGjOyifWufc",
    "config": Config(signature_version="s3v4")
}

bucket_name = "mybucket"
object_name = "testfile.pdf"  # You can change this dynamically if needed

# Create S3 client for MinIO
s3 = boto3.client("s3", **minio_config)

# Generate presigned PUT URL (for uploading from React)
upload_url = s3.generate_presigned_url(
    "put_object",
    Params={"Bucket": bucket_name, "Key": object_name},
    ExpiresIn=3600  # 1 hour
)

# Generate presigned GET URL (for viewing/downloading from React)
view_url = s3.generate_presigned_url(
    "get_object",
    Params={"Bucket": bucket_name, "Key": object_name},
    ExpiresIn=3600
)

print("Upload URL (HTTP):", upload_url)
print("View URL (HTTP):", view_url)
