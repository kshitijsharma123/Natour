const mongoose = require("mongoose");
const tour = require("./tourModel");

const DB = `mongodb+srv://kshitijsharma1221:PUvEzUF8EoLeqkES@cluster.gpxl4jt.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(DB);

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createAt: Date,
    tour: [
      {
        type: mongoose.Schema.ObjectId,

        ref: "tours",
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre("save", function (next) {
  this.createAt = Date.now();

  next();
});

reviewSchema.pre("/^find/", function (next) {
  this.populate({
    path: "User",
    select: "name",
  }).populate({ path: "tour", select: "name" });
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await tour.findByIdAndUpdate(tourId, {
    ratingAverage: stats[0].avgRating,
    ratingQuantity: stats[0].nRating,
  });
};

reviewSchema.post("save", function () {
  // this points to the current review
  this.constructor.calcAverageRating(this.tour);
});

// Hace to fix this code this is not working

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.res = await this.findOne();
//   console.log(this.res);
// });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
