const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');
// const googleAuthRoutes = require('./routes/googleAuthRoutes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(googleAuthRoutes)
app.use('/api/users', apiRoutes);
app.use(errorHandler);

module.exports = app;
