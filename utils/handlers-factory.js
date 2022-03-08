const AppError = require('./AppError');
const { catchAsync } = require('./error-handlers');
const ApiFeatures = require('./ApiFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Add required api features to query.
    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Resolve query promise.
    const docs = await features.query;

    // Respond.
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(
          `No document found with provided id: ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { doc: newDoc },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(
          `No document found with provided id: ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      status: 'success',
      data: { doc },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(
          `No document found with provided id: ${req.params.id}`,
          404
        )
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
