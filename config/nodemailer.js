const nodemailer = require("nodemailer");
const nodemailerExpressHandlebars = require('nodemailer-express-handlebars').default;

const path = require("path");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "Gmail", // or your SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.use(
  "compile",
  nodemailerExpressHandlebars({
    viewEngine: {
      partialsDir: path.resolve("./emails"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./emails"),
  })
);

module.exports = transporter;
