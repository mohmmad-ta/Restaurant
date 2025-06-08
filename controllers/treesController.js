const Trees = require('../models/treeModel');
const factory = require('./handlerFactory');
const multer = require("multer");
const AppError = require("../utils/appError");
const catchAsync = require('./../utils/catchAsync');
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadProductPhoto = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 9},
])
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) Cover image
  req.body.imageCover = `${req.protocol}://${req.get('host')}/public/images/products/${Date.now()}-${req.files.imageCover.fieldname}.jpeg`;
  const nameImageCover = `${Date.now()}-${req.params.id}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/images/products/${nameImageCover}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(
      req.files.images.map(async (file, i) => {
        const nameImages = `${Date.now()}-${req.files.images[i].fieldname}.jpeg`;
        const filename = `${req.protocol}://${req.get('host')}/public/images/products/${Date.now()}-${req.files.images[i].fieldname}.jpeg`;

        await sharp(file.buffer)
            .toFormat('jpeg')
            .jpeg({ quality: 100 })
            .toFile(`public/images/products/${nameImages}`);

        req.body.images.push(filename);
      })
  );


  next();
});


exports.getAllProduct = factory.getAll(Trees);
exports.getOneProduct = factory.getOne(Trees);
exports.createProduct = factory.createOne(Trees);
exports.updateProduct = factory.updateOne(Trees);
exports.deleteProduct = factory.deleteOne(Trees);


exports.MyTrees = async (req, res, next)=>{
  const product = await Trees.find({userId: req.user.id})
  res.status(200).json({status: 'success', data: product});
}



