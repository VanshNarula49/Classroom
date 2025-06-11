// minioPresigned.js
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Read Minio connection settings from environment variables (configured in your Docker Compose)
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://minio:9000';
const MINIO_EXTERNAL_ENDPOINT = process.env.MINIO_EXTERNAL_ENDPOINT || 'http://localhost/minio'; // Public URL via Nginx
const MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD || 'minioadminpassword';
const DEFAULT_BUCKET = 'classroom-uploads'; // Default bucket for file uploads

// This client is for server-to-server communication if needed, ideally using MINIO_ENDPOINT.
// Current configuration uses MINIO_EXTERNAL_ENDPOINT, which might be suboptimal for direct backend<->MinIO traffic.
// However, it's not used by the presigning functions below, so left as is for now.
const s3Client = new S3Client({
  endpoint: MINIO_EXTERNAL_ENDPOINT,
  region: 'classroom-dockerized-network',
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

// Determine the base host for signing. Nginx proxies to MinIO, stripping /minio.
// MinIO sees requests on 'localhost' (from Nginx proxy_set_header Host) at the root path.
// So, the S3 client for signing should use an endpoint like 'http://localhost'.
let signingEndpointHost = 'http://localhost'; // Default if parsing MINIO_EXTERNAL_ENDPOINT fails
try {
  const externalUrl = new URL(MINIO_EXTERNAL_ENDPOINT);
  signingEndpointHost = `${externalUrl.protocol}//${externalUrl.host}`; // e.g., "http://localhost"
} catch (e) {
  console.error(`Invalid MINIO_EXTERNAL_ENDPOINT format: ${MINIO_EXTERNAL_ENDPOINT}. Using default signing host: ${signingEndpointHost}`, e);
}

// S3 client specifically for generating presigned URLs.
// It's configured with an endpoint that reflects what MinIO sees after Nginx proxying (host and root path),
// ensuring the path component of the signature is correct (e.g., /bucket/key, not /minio/bucket/key).
const s3ClientForSigning = new S3Client({
  endpoint: signingEndpointHost,
  region: 'us-east-1', // Use standard region for better compatibility
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

// Generates a presigned URL for downloading (GET) an object (uses external endpoint for browser access)
async function getPresignedUrlForGet(combined, expiresIn = 3600) {
  try {
    const { bucket, key } = parseBucketAndKey(combined);
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    
    // Generate presigned URL using the signing client.
    // This URL will be like http://localhost/bucket/key?... with a signature valid for that path.
    let signedUrl = await getSignedUrl(s3ClientForSigning, command, { expiresIn });
    
    // Transform the URL to the public-facing one (http://localhost/minio/bucket/key?...)
    // by replacing the signing endpoint host with the full MinIO external endpoint.
    if (signedUrl.startsWith(signingEndpointHost + '/')) {
      signedUrl = MINIO_EXTERNAL_ENDPOINT + signedUrl.substring(signingEndpointHost.length);
    }
    // Fallback for safety, though less likely if bucket/key always non-empty
    else if (signedUrl.startsWith(signingEndpointHost)) {
       signedUrl = MINIO_EXTERNAL_ENDPOINT + signedUrl.substring(signingEndpointHost.length);
    }

    return signedUrl;
  } catch (err) {
    console.error('Error generating GET presigned URL:', err);
    throw err;
  }
}

// Generates a presigned URL for uploading (PUT) an object (uses external endpoint for browser access)
async function getPresignedUrlForUpload(combined, expiresIn = 3600) {
  try {
    const { bucket, key } = parseBucketAndKey(combined);
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });

    // Generate presigned URL using the signing client.
    // This URL will be like http://localhost/bucket/key?... with a signature valid for that path.
    let signedUrl = await getSignedUrl(s3ClientForSigning, command, { expiresIn });

    // Transform the URL to the public-facing one (http://localhost/minio/bucket/key?...)
    // by replacing the signing endpoint host with the full MinIO external endpoint.
    if (signedUrl.startsWith(signingEndpointHost + '/')) {
      signedUrl = MINIO_EXTERNAL_ENDPOINT + signedUrl.substring(signingEndpointHost.length);
    }
    // Fallback for safety, though less likely if bucket/key always non-empty
    else if (signedUrl.startsWith(signingEndpointHost)) {
       signedUrl = MINIO_EXTERNAL_ENDPOINT + signedUrl.substring(signingEndpointHost.length);
    }
    
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
