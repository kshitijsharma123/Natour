const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchError");
const mail = require("./../utils/email");

const signToken = (id) => {
  console.log(
    jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })
  );
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createTokenSend = (user, statusCode, res) => {
  const token = signToken(user);
  console.log("TOken in createTokenSend Function ", token, "\n");
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  // console.log(res.cookie("jwt", token, cookieOptions));

  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });

  createTokenSend(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("incorrect Email or password", 404));
  }
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect Password or email", 401));
  }
  console.log("User id in sign up function: ", user._id, "\n");

  createTokenSend(user._id, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  console.log("Header auth", req.headers.authorization, "\n");
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookie) {
    token = req.cookie.jwt;
  }
  console.log("token in protect Route", token);
  if (!token) {
    return next(new AppError("Your are not logged! Please login", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log("decoded obj", decoded, "\n");

  const exitUser = await User.findById(decoded.id);
  console.log(
    "exitUser found after decode the token from the header",
    exitUser,
    "\n"
  );
  if (!exitUser) {
    return next(
      new AppError("The user belonging to the token does not exits", 401)
    );
  }

  if (exitUser.passwordChange(decoded.iat)) {
    return next(new AppError("You just have change the password ", 401));
  }
  req.user = exitUser;
  next();
});

//Only for login Pages
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookie) {
    console.log(req.cookie);
    const decoded = await promisify(jwt.verify)(
      req.cookie.jwt,
      process.env.JWT_SECRET
    );

    const exitUser = await User.findById(decoded.id);

    if (!exitUser) {
      return next();
    }

    if (exitUser.passwordChange(decoded.iat)) {
      return next();
    }
    //There IS A LOGIN USER
    res.local.user;
    next();
  }
  next();
});

exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you dont have the allowed to use this feature", 403)
      );
    }

    return next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(" There is no user with that email address", 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/resetPassword/${resetToken}`;

  const message = `${resetURL} this is the url for reseting your password `;

  try {
    await mail({
      email: user.email,
      subject: "Your password reset token is valid for 10 min only",
      message,
    });

    return res.status(200).json({
      status: "success",
      message: " Token send to email!",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was a error in sending the emai. Please try again later",
        500
      )
    );
    next();
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Getting the user from the data dase using mongo Db query
  console.log(Date.now());
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const isoString = date.toISOString();

  console.log(isoString);

  const hashedToken = crypto // This tokem if written to campare the token
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenEx: { gt: Date.now },
  }); // This code find the user and check if the token is not expired

  // Checking if the user exits with what token and if the token is the expired
  console.log(user);
  if (!user) {
    next(new AppError("There is not user with the token", 404));
  }
  // Changing the password of the user and the login the user in the app
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  (user.passwordResetToken = undefined),
    (user.passwordResetTokenEx = undefined);
  await user.save(); // This code save the new password to the DB, above code only modifi
  // data

  // Sending the token to the user to that tha user can login
  const token = signToken(user._id);
  return res.status(200).json({
    status: "success",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.user.id);
  const user = await User.findById(req.user.id).select("+password");
  console.log(user);
  if (!(await user.correctPassword(req.body.PasswordCurrent, user.password))) {
    // 1st is the password send by the user,2nd is the password which is in the document
    return next(new AppError("The Password is incorrect", 404));
  }

  //Updating the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.PasswordConfirm;
  await user.save({ validateBeforeSave: false });

  createTokenSend(user, 200, res);
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (req.body.name) {
    await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
      },
      { new: true, runValidator: true }
    );
  }
  if (req.body.email) {
    await User.findByIdAndUpdate(
      req.user.id,
      {
        email: req.body.email,
      },
      { new: true, runValidator: true }
    );
  }
  createTokenSend(user, 200, res);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: "null",
  });
});
