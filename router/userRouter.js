const express = require("express");
const router = express.Router();
const userController = require("./../Controller/userController");
const userAuth = require("./../Controller/authController");

router.route("/forgotPassword").post(userAuth.forgotPassword);
router.route("/resetPassword/:token").patch(userAuth.resetPassword);
router.route("/signup").post(userAuth.signup);
router.route("/login").post(userAuth.login);

// Using protect middleware,below this everything user do user have to be authed


router.route("/updateMyPassword").patch(userAuth.updatePassword);

router.route("/me").get(userController.getMe, userController.getUser);

router.route("/updateMe").patch(userAuth.updateMe);
router.route("/deleteMe").delete(userAuth.deleteMe);

router.use(userAuth.allowedTo("admin"));
router
  .route("/")
  .get(userController.getAllUser)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
