const express = require("express");
const router = express.Router();
const newTours = require("../Controller/tour1Controller");

router.route("/").get(newTours.getAllTour).post(newTours.createTour);
module.exports = router;
