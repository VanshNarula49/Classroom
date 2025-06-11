// minioPresigned.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Read Minio connection settings from environment variables (configured in your Docker Compose)
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const MINIO_EXTERNAL_ENDPOINT = process.env.MINIO_EXTERNAL_ENDPOINT || '/minio'; // Public URL via Nginx
const MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD || 'minioadminpassword';
const DEFAULT_BUCKET = 'classroom-uploads'; // Default bucket for file uploads

// S3 client for internal server-to-server communication
const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT, // Use internal endpoint for server communication
  region: 'us-east-1',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// For presigned URLs, we need to use the external endpoint that clients can access
const externalHost = process.env.DOMAIN_NAME ? `https://${process.env.DOMAIN_NAME}` : 'http://localhost';
// Construct the full external endpoint for signing, including the /minio path
const signingEndpoint = externalHost + MINIO_EXTERNAL_ENDPOINT;

// S3 client specifically for generating presigned URLs.
const s3ClientForSigning = new S3Client({
  endpoint: signingEndpoint, // Use the external host + /minio path
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

    // Generate presigned URL using the signing client
    // The URL should now be correctly formed by the SDK due to the endpoint configuration
    const signedUrl = await getSignedUrl(s3ClientForSigning, command, { expiresIn });
    
    // Removed manual URL transformation, as the SDK should handle it with the correct endpoint.

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

    // Generate presigned URL using the signing client
    // The URL should now be correctly formed by the SDK due to the endpoint configuration
    const signedUrl = await getSignedUrl(s3ClientForSigning, command, { expiresIn });

    // Removed manual URL transformation, as the SDK should handle it with the correct endpoint.
    
    return signedUrl;
  } catch (err) {
    console.error('Error generating PUT presigned URL:', err);
    throw err;
  }
}

module.exports = {
  getPresignedUrlForGet,
  getPresignedUrlForUpload,
};
