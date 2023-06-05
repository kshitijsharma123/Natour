const express = require("express");
const route = express.Router({ mergeParams: true });

const tourController = require("./../Controller/tourController");
const authController = require("./../Controller/authController");
const reviewRouter = require("./../router/reviewRouter");

route.use("/:tour/review", reviewRouter);

route.route("/top-5-cheap").get(tourController.cheapFive);

route.route("/distance/:latlng/unit/:unit").get(tourController.getDistance)

route
  .route("/tour-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);
// Can be writin in query string
//but this method is a lot clean and easy to read

route.route("/tour-stats").get(tourController.getTourStats);
route
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.allowedTo("admin,lead-guide"),
    tourController.getMonthlyPlan
  );
route
  .route("/")
  .get(tourController.getAlltour)
  .post(
    authController.protect,
    authController.allowedTo("admin,lead-guide"),
    tourController.createTours
  );

route
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.allowedTo("admin", "lead-guide"),
    tourController.deletetour
  );

// route
//   .route("/:tourId/review")
//   .post(authController.protect, reviewController.writeReview);

// GET tours/:tourId/reviews

module.exports = route;
