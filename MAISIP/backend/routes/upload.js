const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { processDocument } = require('../services/documentService');
const { authenticate } = require('../middleware/auth');

// Generic upload endpoint, protected by authentication
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const processedDoc = await processDocument(req.file);

    res.json({
      success: true,
      data: {
        original_file_name: processedDoc.originalFilename,
        internal_storage_name: processedDoc.storageKey,
        mime_type: processedDoc.mimeType,
        file_size: processedDoc.fileSizeBytes,
        sha256_hash: processedDoc.sha256Hash
      }
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
