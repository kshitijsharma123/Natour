const review = require("./../models/reviewModel");
const catchAsync = require("./../utils/catchError");

exports.getAllReview = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  console.log(filter);
  const reviews = await review.find(filter);

  return res.status(200).json({
    status: "success",
    data: {
      reviews,
    },
  });
});

exports.updataReview = catchAsync(async (req, res, next) => {
  const update = await review.findByIdAndUpdate(req.params.reviews, req.body, {
    runValidators: true,
  });
  return res.status(201).json({
    success: "positive",
    data: {
      update,
    },
  });
});

exports.writeReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tour;
  if (!req.body.user) req.body.user = req.params.id;

  const reviews = await review.create(req.body);
  return res.status(201).json({
    status: "success",
    data: {
      reviews,
    },
  });
});
