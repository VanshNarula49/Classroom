// minioPresigned.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Read Minio connection settings from environment variables (configured in your Docker Compose)
const MINIO_INTERNAL_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const MINIO_PUBLIC_DOMAIN = process.env.MINIO_PUBLIC_DOMAIN || 'https://minio.classroom.set4.me';
const MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD || 'minioadminpassword';
const DEFAULT_BUCKET = 'classroom-uploads'; // Default bucket for file uploads

console.log('MinIO Configuration:');
console.log('MINIO_INTERNAL_ENDPOINT:', MINIO_INTERNAL_ENDPOINT);
console.log('MINIO_PUBLIC_DOMAIN:', MINIO_PUBLIC_DOMAIN);

// S3 client for internal server-to-server communication (backend to MinIO)
const s3Client = new S3Client({
  endpoint: MINIO_INTERNAL_ENDPOINT, // Use internal endpoint for server communication
  region: 'us-east-1',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// S3 client for generating presigned URLs (client accessible URLs)
const s3ClientForSigning = new S3Client({
  endpoint: MINIO_PUBLIC_DOMAIN, // Use public domain for presigned URLs
  region: 'us-east-1',
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

    console.log(`Generating GET URL for bucket: ${bucket}, key: ${key}`);
    console.log(`Using endpoint: ${MINIO_PUBLIC_DOMAIN}`);
    
    // Generate presigned URL using the signing client
    // The URL should now be correctly formed by the SDK due to the endpoint configuration
    const signedUrl = await getSignedUrl(s3ClientForSigning, command, { expiresIn });
    
    console.log(`Generated URL: ${signedUrl}`);
    
    return signedUrl;
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

    console.log(`Generating PUT URL for bucket: ${bucket}, key: ${key}`);
    console.log(`Using endpoint: ${MINIO_PUBLIC_DOMAIN}`);

    // Generate presigned URL using the signing client
    // The URL should now be correctly formed by the SDK due to the endpoint configuration
    const signedUrl = await getSignedUrl(s3ClientForSigning, command, { expiresIn });

    console.log(`Generated URL: ${signedUrl}`);
    
    return signedUrl;
  } catch (err) {
    console.error('Error generating PUT presigned URL:', err);
    throw err;
  }
}

module.exports = {
  s3Client,
  getPresignedUrlForGet,
  getPresignedUrlForUpload,
};
