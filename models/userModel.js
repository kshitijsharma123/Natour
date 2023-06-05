const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrpt = require("bcrypt");
const { stringify } = require("querystring");
const DB = `mongodb+srv://kshitijsharma1221:PUvEzUF8EoLeqkES@cluster.gpxl4jt.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, "Please enter a valid email"],
  },
  passwordChangeAt: Date,

  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Enter your password"],
    minlenght: 8,
    select: false,
  },
  passwordResetToken: String,
  passwordResetTokenEx: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validator: {
      // This only works on CREATE andSAVE!

      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same",
    },
  },
});





userSchema.pre("save", async function (next) {
  // Only run this function when the password is change
  if (!this.isModified("password")) return next();
  // This line  hash the password
  this.password = await bcrpt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrpt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChange = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return changeTimeStamp > JWTTimeStamp;
  }

  return false;
};

userSchema.pre("/^find/", function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetTokenEx = Date() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
