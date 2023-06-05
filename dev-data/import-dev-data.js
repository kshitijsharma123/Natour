const fs = require("fs");
const mongoose = require("mongoose");
const { argv } = require("process");
const Tour = require('./../models/userModel');
// const dotenv = require("dotenv");
// dotenv.config({ path: `.` });

const DB =`mongodb+srv://kshitijsharma1221:PUvEzUF8EoLeqkES@cluster.gpxl4jt.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(DB);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/${process.argv[2]}`, "utf8")
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("data is loaded");
    process.exit();
  } catch (err) {
    console.log(err);
  } 
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("data is being deleted");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[3] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
console.log(process.argv);