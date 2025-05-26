// minioPresigned.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Read Minio connection settings from environment variables (configured in your Docker Compose)
const MINIO_ENDPOINT = 'http://localhost:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD || 'minioadminpassword';
const DEFAULT_BUCKET = 'classroom-uploads'; // Default bucket for file uploads

// Create an S3 client for Minio (forcePathStyle is required)
const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'classroom-dockerized-network',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// Helper function that parses a combined string in the format "bucket-name/object-key"
function parseBucketAndKey(combined) {
  const index = combined.indexOf('/');
  if (index === -1) {
    // If no bucket specified, use default bucket
    return { bucket: DEFAULT_BUCKET, key: combined };
  }
  const bucket = combined.substring(0, index);
  const key = combined.substring(index + 1);
  return { bucket, key };
}

// Generates a presigned URL for downloading (GET) an object
async function getPresignedUrlForGet(combined, expiresIn = 3600) {
  try {
    const { bucket, key } = parseBucketAndKey(combined);
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (err) {
    console.error('Error generating GET presigned URL:', err);
    throw err;
  }
}

// Generates a presigned URL for uploading (PUT) an object
async function getPresignedUrlForUpload(combined, expiresIn = 3600) {
  try {
    const { bucket, key } = parseBucketAndKey(combined);
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (err) {
    console.error('Error generating PUT presigned URL:', err);
    throw err;
  }
}

module.exports = {
  getPresignedUrlForGet,
  getPresignedUrlForUpload,
};
