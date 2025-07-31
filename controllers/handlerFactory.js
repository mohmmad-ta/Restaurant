const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({status: 'success', data: null});
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({status: 'success', data: doc});
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    const doc = await Model.create(req.body);

    res.status(201).json({status: 'success', data: doc});
  });

exports.getOne = Model =>
  catchAsync(async (req, res, next) => {
    const query = await Model.findById(req.params.id)
    res.status(200).json({status: 'success', data: query});
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
      console.log("🔍 Final Query Params:", req);

      let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({status: 'success', results: doc.length, data: doc});
  });
