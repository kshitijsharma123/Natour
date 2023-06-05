const express = require("express");
const route = express.Router();
const authController = require("./../Controller/authController");
const viewController = require("./../Controller/viewController");

route.use(authController.isLoggedIn);

route.get("/", viewController.getOverviewPage);
route.get("/tour/:slug", viewController.getTourPage);
route.get("/login", viewController.getLogin);
module.exports = route;
