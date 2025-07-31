const Restaurant = require('../../models/auth/restaurantModel');
const Delivery = require('../../models/auth/deliveryModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const multer = require("multer");
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
    {name: 'image', maxCount: 1},
])
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.image) return next();
    // 1) image
    req.body.image = `${req.protocol}://${req.get('host')}/public/images/users/${Date.now()}-${req.files.image.fieldname}.jpeg`;
    const nameImage = `${Date.now()}-${req.params.id}.jpeg`;
    await sharp(req.files.image[0].buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 100 })
        .toFile(`public/images/users/${nameImage}`);
    next();
});


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getMeRestaurant = async (req, res, next) => {
    req.params.id = req.user.id;
    const user = await Restaurant.findById(req.params.id).populate('delivery')
    res.status(200).json({
        status: 'success',
        data: user
    });
};


exports.updateMeRestaurant = catchAsync(async (req, res, next) => {
    const filteredBody = filterObj(req.body, 'name', 'discount', 'image');
    if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await Restaurant.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMeRestaurant = catchAsync(async (req, res, next) => {
    await Restaurant.findByIdAndUpdate(req.user.id, { deleted: true });

    res.status(204).json({
        status: 'success',
        data: null
    });
});


