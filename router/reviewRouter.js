const express = require("express");
const route = express.Router({ mergeParams: true });
const reviewController = require("./../Controller/reviewController");
const userAuth = require("./../Controller/authController");

route.use(userAuth.protect);

route.route('/:reviews').post(reviewController.updataReview);
route.route("/").post(reviewController.writeReview);
route.route("/").get(reviewController.getAllReview);

module.exports = route;
