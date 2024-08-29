const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  serialNumber: Number,
  productName: String,
  inputUrls: [String],
  outputUrls: [String],
});

const requestSchema = new mongoose.Schema({
  requestId: String,
  products: [productSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);
