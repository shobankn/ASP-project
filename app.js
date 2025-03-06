require('dotenv').config({ path: '.env' });
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const DataBaseConnection = require('./config/dbCon');
const path = require('path');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/error');
const Adminroute = require('./src/routes/adminAuthroute');

// Create Express app
const app = express();

// Load env vars
dotenv.config({ path: '.env' });

DataBaseConnection();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}



// Enable CORS
app.use(cors({ origin: '*' }));


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());


// admin route
app.use('/api/admin',Adminroute);

// Error handling middleware at the end
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Error Handling Middleware (MUST be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});