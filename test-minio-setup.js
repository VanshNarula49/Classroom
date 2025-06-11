const { s3Client, s3ClientExternal, bucketName, ensureBucketExists } = require('./config/minio');

async function testMinIOSetup() {
    try {
        console.log('Testing MinIO setup...\n');
        
        // Check environment variables
        console.log('Environment variables:');
        console.log('MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);
        console.log('MINIO_EXTERNAL_ENDPOINT:', process.env.MINIO_EXTERNAL_ENDPOINT);
        console.log('Bucket name:', bucketName);
        console.log('');
        
        // Ensure bucket exists
        console.log('Ensuring bucket exists...');
        await ensureBucketExists();
        console.log('✅ Bucket setup complete');
        console.log('');
        
        // Test internal client bucket list
        console.log('Testing internal client (server operations):');
        try {
            const listResult = await s3Client.listBuckets();
            console.log('Available buckets:', listResult.Buckets?.map(b => b.Name) || []);
        } catch (error) {
            console.log('❌ Internal client error:', error.message);
        }
        console.log('');
        
        // Test a simple upload with internal client
        console.log('Testing file upload with internal client:');
        try {
            const testContent = 'This is a test file content';
            const testKey = 'test-files/test-upload.txt';
            
            await s3Client.putObject({
                Bucket: bucketName,
                Key: testKey,
                Body: testContent,
                ContentType: 'text/plain'
            });
            
            console.log('✅ File uploaded successfully');
            
            // Test presigned URL for download
            console.log('Testing presigned URL for the uploaded file:');
            const { getPresignedUrlForGet } = require('./config/minio');
            const downloadUrl = await getPresignedUrlForGet(bucketName, testKey);
            console.log('Download URL:', downloadUrl);
            console.log('URL uses external endpoint:', downloadUrl.includes('localhost:9000'));
            
        } catch (error) {
            console.log('❌ Upload test error:', error.message);
        }
        
    } catch (error) {
        console.error('MinIO setup test failed:', error.message);
    }
}

testMinIOSetup();
