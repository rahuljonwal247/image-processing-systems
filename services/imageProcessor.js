

const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Request = require('../models/request');


const IMAGE_DIRECTORY = path.join(__dirname, '..', 'public', 'output'); // Directory to save images

// Ensure the output directory exists
if (!fs.existsSync(IMAGE_DIRECTORY)) {
  fs.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
}

// Asynchronous Image Processing Function
async function processImages(requestId) {
  const request = await Request.findOne({ requestId });
  if (!request) return;

  request.status = 'processing';
  await request.save();

  for (const product of request.products) {
    const outputUrls = [];

    for (const inputUrl of product.inputUrls) {
      try {
        // Download Image
        const response = await axios({ url: inputUrl, responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(response.data);

        // Compress Image
        const outputBuffer = await sharp(inputBuffer).jpeg({ quality: 50 }).toBuffer();

        // Define local file path for saving the image
        const fileName = `${Date.now()}_${Math.random()}.jpg`;
        const outputPath = path.join(IMAGE_DIRECTORY, fileName);

        // Save Processed Image Locally
        fs.writeFileSync(outputPath, outputBuffer);

        // Construct localhost URL for the saved image
        const outputUrl = `${process.env.HOST_NAME}/output/${fileName}`;
        outputUrls.push(outputUrl);
      } catch (err) {
        console.error(`Failed to process image ${inputUrl}:`, err);
      }
    }

    product.outputUrls = outputUrls;
  }

  request.status = 'completed';
  await request.save();

  // Trigger Webhook
  await triggerWebhook(request);

  console.log(`Processing completed for request ID: ${requestId}`);
}

// Function to Trigger Webhook
async function triggerWebhook(request) {
  const webhookUrl = process.env.WEBHOOK_URL;  // Replace with your webhook URL

  const payload = {
    requestId: request.requestId,
    status: request.status,
    products: request.products.map(product => ({
      productId: product.productId,
      outputUrls: product.outputUrls
    }))
  };

  try {
    const response = await axios.post(webhookUrl, payload);
    console.log(`Webhook triggered successfully: ${response.status}`);
  } catch (err) {
    console.error('Failed to trigger webhook:', err.message);
  }
}

module.exports = { processImages };





