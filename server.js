const dotenv = require("dotenv");
// const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

const app = require("./app");

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server: ${port}`);
});

process.on("uncaughtException", (err) => {
  console.log(err);

  server.close(() => {
    process.exit(1);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLER REJECTION");
  server.close(() => {
    process.exit(1);
  });
});

