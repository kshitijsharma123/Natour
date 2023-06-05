const fs = require("fs");
const url = require("url");
const path = require("path");

const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
const ratelimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cleanX = require("xss-clean");
const hpp = require("hpp");
const slug = require("slugify");
const  cookieParser = require('cookie-parser')

const AppError = require("./utils/appError");
const UserRouter = require("./router/userRouter");
const toursRoute = require("./router/toursRoutes");
const new_tourRoute = require("./router/new-tourRoutes");
const errorController = require("./Controller/errorController");
const reviewRouter = require("./router/reviewRouter");
const viewRouter = require("./router/viewRouter");
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//middleWare
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
}));
  
  // app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(cleanX());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "data:", "blob:"],

      fontSrc: ["'self'", "https:", "data:"],

      scriptSrc: ["'self'", "unsafe-inline"],

      scriptSrc: ["'self'", "https://*.cloudflare.com"],

      scriptSrcElem: ["'self'", "https:", "https://*.cloudflare.com"],

      styleSrc: ["'self'", "https:", "unsafe-inline"],

      connectSrc: [
        "'self'",
        "data:",
        "https://*.cloudflare.com",
        "http://127.0.0.1:3000",
      ],
    },
  })
);
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

const loginRateLimit = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many request ",
  standardHeader: true,
  legacyHeader: false,
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  // console.log(req.headers);
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//Test Middleware
app.use((req,res,next)=>{
console.log(req.cookies)
  next();
})

app.use("/api/v1/user/login", loginRateLimit);

// Pages
app.use("/", viewRouter);
//router for tours
app.use("/api/v1/tours", toursRoute);
app.use("/api/v1/new-tour", new_tourRoute);

// routes for user
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/review", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.url} on this server`, 404));
});

app.use(errorController);

module.exports = app;
