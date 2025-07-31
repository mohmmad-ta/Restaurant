const User = require('../../models/auth/userModel');
const Admin = require('../../models/auth/adminModel');
const catchAsync = require('../../utils/catchAsync');
const Delivery = require("../../models/auth/deliveryModel");
const Restaurant = require("../../models/auth/restaurantModel");
const factory = require('./../handlerFactory');

exports.getMeAdmin = async (req, res, next) => {
    req.params.id = req.user.id;
    const user = await Admin.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: user
    });
};


// ###  === CRUD User ===  ###
exports.adminGetUser = factory.getOne(User);
exports.adminGetAllUsers = factory.getAll(User);

// Do NOT update passwords with this!
exports.adminUpdateUser = factory.updateOne(User);
exports.adminDeleteUser = factory.deleteOne(User);

// ###  === CRUD Delivery ===  ###
exports.adminGetDelivery = factory.getOne(Delivery);
exports.adminGetAllDelivery = factory.getAll(Delivery);

// Do NOT update passwords with this!
exports.adminUpdateDelivery = factory.updateOne(Delivery);
exports.adminDeleteDelivery = factory.deleteOne(Delivery);

// ### === CRUD Restaurant === ###
exports.adminGetRestaurant = async (req, res, next) => {
    const user = await Restaurant.findById(req.params.id).populate('delivery').populate('meal')
    res.status(200).json({
        status: 'success',
        data: user
    });
};
exports.adminGetAllRestaurant = factory.getAll(Restaurant);

// Do NOT update passwords with this!
exports.adminUpdateRestaurant = factory.updateOne(Restaurant);
exports.adminDeleteRestaurant = factory.deleteOne(Restaurant);
