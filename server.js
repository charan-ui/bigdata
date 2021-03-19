const express = require('express');
const { connectRedis } = require('./config/db');
const cors = require('cors');
const planRouter = require('./routes/planRoute');
const logger = require('./utils/logger');

// Connect to DB
connectRedis();

const app = express();

// Enable CORS
app.use(cors());

// Body - parser
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Mount routes
app.use('/api/v1/plan', planRouter);


const port = 5000;
app.listen(port, () => logger.info(`Server up and running on port: ${port}`));