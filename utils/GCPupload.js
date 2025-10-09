const { Storage } = require("@google-cloud/storage");

const cloudStorage = new Storage({
  keyFilename: "event-storage-service-123456.json", // path to JSON key
  projectId: "eventra-472315",
}); 
const bucketName = "eventra-files";
const bucket = cloudStorage.bucket(bucketName);

async function uploadToGCP(file, folder) {
  try {
    if(!file) return null;

    const blob = bucket.file(`${folder}/${Date.now()}-${randomString()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype
    });

     return new Promise((resolve, reject) => {
      blobStream.on("error", reject);

      blobStream.on("finish", async () => {
        
        // Public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (err) {
    console.error("GCP Upload Error:", err);
    throw err;
  }
};

const randomString = (length = 5) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {uploadToGCP, bucket};