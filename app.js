const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
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
app.use('/api/users', userRoutes);
app.use(errorHandler);

module.exports = app;
