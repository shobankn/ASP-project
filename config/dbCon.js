const mongoose = require('mongoose');
const logger = require('../src/utils/logger');


const DataBaseConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = DataBaseConnection;