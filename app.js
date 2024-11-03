const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const adminRoutes = require('./routes/adminRoutes');
// const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(authRoutes)
app.use('/api/users', adminRoutes);
app.use(errorHandler);

module.exports = app;
