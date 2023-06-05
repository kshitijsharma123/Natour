const { default: slugify } = require("slugify");
const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchError");

function replaceHyphenWithSpace(text) {
  return text.replace(/-/g, " ");
}

exports.getOverviewPage = catchAsync(async (req, res) => {
  // 1) Get tour data from the collection
  const tours = await Tour.find();

  tours.forEach((tour) => {
    tour.slug = slugify(tour.name);
  });

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTourPage = catchAsync(async (req, res) => {
  console.log(replaceHyphenWithSpace(req.params.slug));

  const tour = await Tour.findOne({
    name: replaceHyphenWithSpace(req.params.slug),
  });
  // .populate({
  //   path:'reviews',
  //   fields:'review rating user'
  // });

  res.status(200).render("tour", {
    title: req.params.slug,
    tour,
  });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render("login", { title: "login" });
});
