// src/server.js
const app = require('./app');
require ('./cron/billingReminder')

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
