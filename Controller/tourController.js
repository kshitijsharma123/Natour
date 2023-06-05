const fs = require("fs");
const AppError = require("../utils/appError");

const Tours = require("./../models/tourModel");
const catchAsync = require("./../utils/catchError");
const factory = require("./handleFactory");

exports.createTours = catchAsync(async (req, res, next) => {
  const newTour = await (await Tours.create(req.body)).populate("reviews");
  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
  // next(new AppError("Cant create a new request", 401));
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tours = await Tours.findById(req.params.id);
  if (!tours) {
    return next(new AppError("No tour with that id man"), 404);
  }

  res.status(200).json({
    status: "succes",
    data: {
      tour: tours,
    },
  });
});

exports.getAlltour = catchAsync(async (req, res, next) => {
  console.log(req.query);

  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];

  excludedFields.forEach((field) => {
    delete queryObj[field];
  });

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

  let queryDB = Tours.find(JSON.parse(queryStr));

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryDB = queryDB.sort(sortBy);
    console.log(sortBy);
  } else {
    queryDB = queryDB.sort("--createdAt");
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryDB = queryDB.select(fields);
    console.log(fields);
  } else {
    queryDB = queryDB.select("-__v");
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  queryDB = queryDB.skip(skip).limit(limit);

  // Data Send

  const resultTours = await queryDB;

  return res.status(200).json({
    status: "succes",
    result: resultTours.length,
    data: {
      tour: resultTours,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tourUpdate = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(204).json({
    status: "succes",
    data: {
      tourUpdate,
    },
  });
  next(new AppError("test", 404));
});

// exports.deletetour = factory.deleteOne(Tours);

exports.deletetour = catchAsync(async (req, res, next) => {
  if (await Tours.findByIdAndDelete(req.params.id)) {
    return next(AppError("no doc", 404));
  }
  return res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.cheapFive = catchAsync(async (req, res) => {
  const toptours = await Tours.find()
    .sort({ price: 1, ratingsAverage: 1 })
    .limit(5);
  console.log(toptours);
  res.status(200).json({
    status: "succes",
    result: toptours.length,
    data: {
      toptours,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tours.aggregate([
    {
      $match: { name: "The Snow Adventurer " },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  return res.status(200).json({
    status: "succes",

    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const monthlyplan = await Tours.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },

    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res.status(200).json({
    status: "succes",
    data: {
      monthlyplan,
    },
  });

  next(new AppError("test", 404));
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  //This we have done because mongodb use radius of the shpere to cal the results
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  console.log(radius);
  if (!lat || !lng) {
    next(
      AppError("The location is not there,Please give us the location", 400)
    );
  }

  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  console.log(distance, lat, lng, unit);
  res.status(200).json({
    success: "positive",
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  if (!lat || !lng) {
    next(
      AppError(
        "The Location is the there,Please provide us with the location",
        400
      )
    );
  }

  // For Calculation we always use aggreation pipeline

  const distance = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        
      },
    },
  ]);

  res.status(200).json({
    success: "positive",
    data: {
      distance,
    },
  });
});
