const { getPresignedUrlForGet, getPresignedUrlForUpload } = require('./config/minio');

async function testPresignedURLs() {
    try {
        console.log('Testing presigned URL generation...\n');
        
        // Test get presigned URL
        console.log('1. Testing getPresignedUrlForGet:');
        const getUrl = await getPresignedUrlForGet('test-bucket', 'test-file.txt');
        console.log('Get URL:', getUrl);
        console.log('Contains localhost:9000:', getUrl.includes('localhost:9000'));
        console.log('Contains minio:9000:', getUrl.includes('minio:9000'));
        console.log('');
        
        // Test upload presigned URL
        console.log('2. Testing getPresignedUrlForUpload:');
        const uploadUrl = await getPresignedUrlForUpload('test-bucket', 'test-upload.txt');
        console.log('Upload URL:', uploadUrl);
        console.log('Contains localhost:9000:', uploadUrl.includes('localhost:9000'));
        console.log('Contains minio:9000:', uploadUrl.includes('minio:9000'));
        console.log('');
        
        // Verify external endpoint configuration
        if (getUrl.includes('localhost:9000') && uploadUrl.includes('localhost:9000')) {
            console.log('✅ SUCCESS: Presigned URLs are using external endpoint (localhost:9000)');
        } else {
            console.log('❌ FAILURE: Presigned URLs are not using correct external endpoint');
        }
        
    } catch (error) {
        console.error('Error testing presigned URLs:', error.message);
    }
}

testPresignedURLs();
