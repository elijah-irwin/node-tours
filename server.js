require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// DB Connection.
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

// Run Server.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Maks Tours is running on port: ${port}!`);
});
