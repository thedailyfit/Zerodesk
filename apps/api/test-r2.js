const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testR2() {
  console.log("Testing R2 upload...");
  console.log("Endpoint:", process.env.R2_ENDPOINT);
  
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
  });

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: 'test-folder/hello-world.txt',
    Body: 'Hello from ZeroDesk AI!',
    ContentType: 'text/plain',
  });

  try {
    await client.send(command);
    console.log("✅ Successfully uploaded test file to R2!");
    console.log(`Check your Cloudflare dashboard inside the bucket '${process.env.R2_BUCKET_NAME}'`);
  } catch (err) {
    console.error("❌ Failed to upload to R2:");
    console.error(err);
  }
}

testR2();
