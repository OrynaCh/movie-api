const express = require("express");
const bodyParser = require("body-parser");
const repository = require("./src/repository/repository");
const routes = require("./src/routes/movie-routes");

const port = process.env.PORT || 3001;
repository.init();
const app = express();
app.use(bodyParser.json());
app.use("/", routes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
