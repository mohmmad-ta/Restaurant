const Meal = require('./../models/mealModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const Restaurant = require("../models/auth/restaurantModel");

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage';
    next();
};

exports.getAllMeals = factory.getAll(Meal);
exports.getMeal = factory.getOne(Meal);
exports.updateMeal = factory.updateOne(Meal);
exports.deleteMeal = factory.deleteOne(Meal);

exports.createMeal = catchAsync(async (req, res, next)=>{
    const meal = await Meal.create({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        // image: req.file.image,
        restaurantId: req.user.id,
    });
    res.status(200).json({
        status: 'success',
        data: {
            meal: meal
        }
    });
})

exports.getAllMyMeals = async (req, res, next) => {
    const data = await Restaurant.findById(req.user.id).populate('meal');
    res.status(200).json({
        status: 'success',
        data: data.meal
    });
};