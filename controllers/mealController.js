const Meal = require('./../models/mealModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const Restaurant = require("../models/auth/restaurantModel");
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
    console.log(req);
    if (!req.files.image) return next();
    // 1) image
    req.body.image = `${req.protocol}://${req.get('host')}/public/images/meals/${Date.now()}-${req.files.image.fieldname}.jpeg`;
    const nameImage = `${Date.now()}-${req.params.id}.jpeg`;
    await sharp(req.files.image[0].buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 100 })
        .toFile(`public/images/meals/${nameImage}`);
    next();
});


exports.getAllRestaurant = factory.getAll(Restaurant);
exports.getMeal = factory.getOne(Meal);
exports.updateMeal = factory.updateOne(Meal);
exports.deleteMeal = factory.deleteOne(Meal);
exports.createMeal = factory.createOne(Meal);


exports.getAllMyMeals = async (req, res, next) => {
    const data = await Restaurant.findById(req.user.id).populate('meal');
    res.status(200).json({
        status: 'success',
        data: data.meal
    });
};
exports.getRestaurantMeals = async (req, res, next) => {
    const data = await Restaurant.findById(req.params.id).populate('meal');
    res.status(200).json({
        status: 'success',
        data: data
    });
};
exports.getRestaurantSearch = async (req, res, next) => {
    const query = req.query.q || ''; // e.g., /api/meals/search?q=chicken

    const meals = await Restaurant.find({
        name: { $regex: query.toString(), $options: 'i' }, // case-insensitive
    });
    res.status(200).json({
        status: 'success',
        data: meals
    });
};