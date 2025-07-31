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
        deliveryId: req.body.restaurantId,
        item: req.body.item,
        location: req.body.location,
    });

    sendOrderToUser(req.user.id, order, "create-order");
    sendOrderToUser(req.body.restaurantId, order, "create-order");

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

exports.getOrderStatus = (id) => async (req, res, next) => {
    let idParams = req.user.id;
    let access = id;
    if (access === "deliveryId" && req.params.id === "2") {
        access = 'restaurantId'
        idParams = req.user.restaurantId.toHexString()
    }
    const data = await Order.find({[access]: idParams , status: req.params.id});
    res.status(200).json({
        status: 'success',
        data: data
    });
};

exports.changStatus = (id) => async (req, res, next) => {
    let idParams = req.user.id;
    let access = id;
    if (id === "deliveryId" && req.body.lastState === "2") {
        access = 'restaurantId';
        idParams = req.user.restaurantId.toHexString();
    }

    const filter = { [access]: idParams, _id: req.body.id };
    const update = { status: req.body.status };
    if (req.body.lastState === "2") {
        update.deliveryId = req.user.id;
    }

    const data = await Order.findOneAndUpdate(filter, update, { new: true });

    if (!data) {
        return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    const restaurantId = data.restaurantId.id;
    const deli = await Restaurant.findById(restaurantId).populate('delivery');

    // Send to all delivery users
    if (data.status === "2") {
        if (deli?.delivery?.length) {
            deli.delivery.forEach((item) => {
                sendOrderToUser(item._id.toString(), data, `change-status-to-deli`);
            });
        }
    }else if (data.status === "3"){
        if (deli?.delivery?.length) {
            deli.delivery.forEach((item) => {
                sendOrderToUser(item._id.toString(), data, `change-status-to-delete-from-deli`);
            });
        }
        sendOrderToUser(data.deliveryId, data, `change-status-to-deli-forMe-3`);

    }else if (data.status === "4"){
        sendOrderToUser(data.deliveryId, data, `change-status-to-deli-forMe-4`);
    }
    // Send to restaurant
    sendOrderToUser(restaurantId, data, `change-status-to-rest`);

    // Send to customer
    sendOrderToUser(data.userId.id, data, `change-status-to-user`);

    res.status(200).json({
        status: 'success',
        data
    });
};
