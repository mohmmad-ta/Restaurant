const {Router} = require('express');
const {createOrder, getAllMyOrder, getOrderStatus} = require('../controllers/orderController');
const {protect, restrictTo} = require('../controllers/auth/authController');
const Order = require('./../models/orderModel');
const User = require('./../models/auth/userModel');
const Delivery = require('./../models/auth/deliveryModel');
const Restaurant = require('./../models/auth/restaurantModel');

const router = Router();


// Restaurant Controller
router.get('/user/myAllOrders', protect(User), restrictTo('user'), getAllMyOrder('userId'));
router.post('/user/createOrder', protect(User), restrictTo('user'), createOrder);

// Restaurant Controller
router.get('/restaurant/myAllOrders', protect(Restaurant), restrictTo('restaurant'), getAllMyOrder('restaurantId'));
router.post('/restaurant/createOrder', protect(Restaurant), restrictTo('restaurant'), createOrder);

// Delivery Controller
router.get('/delivery/getOrderStatus2', protect(Delivery), restrictTo('delivery'), getOrderStatus('deliveryId', 2));
router.get('/delivery/getOrderStatus3', protect(Delivery), restrictTo('delivery'), getOrderStatus('deliveryId', 3));
router.get('/delivery/getOrderStatus4', protect(Delivery), restrictTo('delivery'), getOrderStatus('deliveryId', 4));
router.post('/delivery/createOrder', protect(Delivery), restrictTo('delivery'), createOrder);


module.exports = router;