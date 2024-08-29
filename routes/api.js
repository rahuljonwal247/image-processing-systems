const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Request = require('../models/request');
const { processImages } = require('../services/imageProcessor');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload API
router.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const products = [];
  const requestId = uuidv4();

  // Validate and Parse CSV
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      products.push({
        serialNumber: row['Serial Number'],
        productName: row['Product Name'],
        inputUrls: row['Input Image Urls'].split(',').map(url => url.trim()),
      });
    })
    .on('end', async () => {
      // Save Request to Database
      const newRequest = new Request({ requestId, products });
      await newRequest.save();

      // Initiate Asynchronous Image Processing
      processImages(requestId);

      res.json({ requestId });
    });
});

// Status API
router.get('/status/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const request = await Request.findOne({ requestId });

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.json({ status: request.status, products: request.products });
});

module.exports = router;

