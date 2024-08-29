const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');


// Load environment variables
require('dotenv').config();

// Serve static files from the 'public' directory
app.use('/output', express.static(path.join(__dirname, 'public', 'output')));



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



