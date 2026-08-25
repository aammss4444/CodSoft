const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FileType = require('file-type');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'video/mp4'];

/**
 * Validates magic numbers, computes SHA-256, runs AV stub, and renames file with correct extension.
 * @param {Object} file - The multer file object
 * @returns {Promise<Object>} Processed file metadata
 */
async function processDocument(file) {
  // 1. Validate real MIME type via magic numbers
  const type = await FileType.fromFile(file.path);
  
  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
    fs.unlinkSync(file.path); // Delete invalid file
    throw new Error('Invalid file type. Only PDF, JPG, PNG, and MP4 are allowed.');
  }

  // 2. Compute SHA-256
  const fileBuffer = fs.readFileSync(file.path);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const sha256_hash = hashSum.digest('hex');

  // 3. Antivirus scan stub
  await stubAntivirusScan(file.path);

  // 4. Rename file to include true extension safely
  const newFilename = `${file.filename}.${type.ext}`;
  const newPath = path.join(file.destination, newFilename);
  fs.renameSync(file.path, newPath);

  return {
    originalFilename: file.originalname,
    storageKey: newFilename,
    mimeType: type.mime,
    fileSizeBytes: file.size,
    sha256Hash: sha256_hash
  };
}

async function stubAntivirusScan(filePath) {
  return new Promise((resolve) => {
    // Simulate a brief scan delay
    setTimeout(() => {
      // In a real implementation, we would pass the file stream to ClamAV or similar.
      // If a virus is found, throw an error and delete the file.
      resolve(true);
    }, 100);
  });
}

module.exports = { processDocument };
