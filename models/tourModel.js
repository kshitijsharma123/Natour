const mongoose = require("mongoose");
const dotenv = require("dotenv");
const slugify = require("slugify");
// const User = require("./userModel");

const DB = `mongodb+srv://kshitijsharma1221:PUvEzUF8EoLeqkES@cluster.gpxl4jt.mongodb.net/?retryWrites=true&w=majority`;
// const Date=new Date()
mongoose.connect(DB).then(console.log("Connected to the DB"));
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour must have a name"],
    },
    slug: String,

    duration: {
      type: Number,
      required: [true, "A Tour must have a duration"],
    },

    maxGroupSize: {
      type: Number,
      required: [true, "A Tour must have a groupSize"],
    },

    difficulty: {
      type: String,
      required: [true, "A Tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "hard"],
        message: " difficulty must be easy, hard or medium",
      },
    },

    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, " It must be above 1"],
      max: [5, " It must be above 5"],
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },

    rating: { type: Number, default: 4.5 },

    price: {
      type: Number,
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price must be less the the actual price",
      },
    },

    summary: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
    },

    imageCover: {
      type: String,
    },

    images: [String],

    createAt: {
      type: Date,
      default: Date.now(),
    },

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },

      coordinates: [Number],
      address: String,
      description: String,
    },

    location: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    startDates: [Date],

    secretTour: { type: Boolean, default: false },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

toursSchema.index({ price: 1, ratingAverage: -1 });
toursSchema.index({ slug: 1 }); 
toursSchema.index({ startLocation: '2dsphere' });


toursSchema.pre("/^find/", function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangeAt",
  });
  next();
});

// Virtual Populate
toursSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "tours",
  localField: "_id",
});

toursSchema.pre("save", async function (next) {
  const guidesPro = this.guides.map(async (el) => await User.findById(el));
  
  this.guides = await Promise.all(guidesPro);
  next();
});

toursSchema.virtual("durationWeek").get(function () {
  return this.duration / 7;
});

// Query MIDDLEWARE

toursSchema.pre("/^find/", function (next) {
  this.find({ secretTour: { $ne: true } });
    next();
  });
  
  const tours = mongoose.model("tours", toursSchema);
  
  // toursSchema.index({ startLocation: '2dsphere' });
  // toursSchema.createIndex({ startLocation: "2dsphere" });
  module.exports = tours;
  