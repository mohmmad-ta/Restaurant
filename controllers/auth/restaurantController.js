const Restaurant = require('../../models/auth/restaurantModel');
const Delivery = require('../../models/auth/deliveryModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const multer = require("multer");

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/users');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});
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
exports.uploadUserPhoto = upload.single('photo');


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
    const filteredBody = filterObj(req.body, 'name');
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
    await Restaurant.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

