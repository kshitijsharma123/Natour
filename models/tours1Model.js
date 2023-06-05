const mongoose = require("mongoose");

const DB = `mongodb+srv://kshitijsharma1221:PUvEzUF8EoLeqkES@cluster.gpxl4jt.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(DB),
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  };

const tours1Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
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

  startDates: [Date],

  secretTour: { type: Boolean, default: false },
});

const tour1 = mongoose.model("tour1", tours1Schema);
module.exports = tour1;
