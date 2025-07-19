const Order = require('./../models/orderModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
const Delivery = require("../models/auth/deliveryModel");
const Restaurant = require("../models/auth/restaurantModel");
const {sendOrderToUser, broadcastOrder} = require("./wsController");

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage';
    next();
};

exports.createOrder = catchAsync(async (req, res, next)=>{
    const order = await Order.create({
        userId: req.user.id,
        restaurantId: req.body.restaurantId,
        item: req.body.item,
        location: req.body.location,
    });
    broadcastOrder(order)
    sendOrderToUser(req.body.restaurantId, order);
    res.status(200).json({
        status: 'success',
        data: {
            order: order
        }
    });
})

exports.getOrder = async (req, res, next) => {
    const data = await Order.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: data
    });
};
exports.getAllMyOrder = (id) => async (req, res, next) => {
    const data = await Order.find({[id]: req.user.id});
    res.status(200).json({
        status: 'success',
        data: data
    });
};

exports.getOrderStatus = (id, status) => async (req, res, next) => {
    let idParams = req.user.id;
    if (id === "deliveryId" && status === 2) {
        id = 'restaurantId'
        idParams = req.user.restaurantId.toHexString()
    }
    const data = await Order.find({[id]: idParams , status: req.params.id});
    res.status(200).json({
        status: 'success',
        data: data
    });
};

exports.changStatus = (id, status) => async (req, res, next) => {
    let idParams = req.user.id;
    if (id === "deliveryId" && status === 2) {
        id = 'restaurantId'
        idParams = req.user.restaurantId.toHexString()
    }
    const data = await Order.findOneAndUpdate({[id]: idParams , _id: req.params.id}, {status: req.body.status}, {
        new: true,
    });
    sendOrderToUser(req.body.restaurantId, data);

    res.status(200).json({
        status: 'success',
        data: data
    });
};