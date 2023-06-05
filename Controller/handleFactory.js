const catchAsync = require("./../utils/catchError");
// const AppError = require("../utils/appError");

// exports.deleteOne = Model = catchAsync(async (req, res, next) => {
//   const doc = await Model.findByIdAndDelete(req.params.id);
// //   if (!doc) {
// //     return next(AppError("THere is no document"));
// //   }
//   return res.status(204).json({
//     status: "success",
//     data: "null",
//   });
// });

// exports.deletetour = catchAsync(async (req, res) => {
//   const deleteTours = await Tours.findByIdAndDelete(req.params.id);
// });
exports.deleteOne=(model)=catchAsync(async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id);
  });