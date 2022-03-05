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
  })
  .catch((err) => console.log(err.name, err.message));

// Run Server.
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Maks Tour's is running on port: ${port}!`));
