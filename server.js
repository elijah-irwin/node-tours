const app = require('./app');

// Run Server
const port = 3000;
app.listen(port, () => {
  console.log(`app running on port: ${port}`);
});
