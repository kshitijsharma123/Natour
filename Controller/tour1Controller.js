const newTours = require("./../models/tours1Model");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchError");

exports.getAllTour = catchAsync(async (req, res, next) => {
  const Tour = await newTours.find();

  res.status(200).json({
    status: "success",
    result: Tour.length,
    data: {
      Tour,
    },
  });
  next(new AppError("Someting is wrong ", 404));
});

exports.createTour = catchAsync(async (req, res, next) => {
  const createTous = await newTours.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tours: createTous,
    },
  });
  next(new AppError("No Tour is created", 404));
});
