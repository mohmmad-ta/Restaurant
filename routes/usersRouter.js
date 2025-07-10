const {Router} = require('express');
const {deleteMe, getMe, updateMe} = require('../controllers/auth/userController');
const { getMeDelivery, updateMeDelivery, deleteMeDelivery} = require('../controllers/auth/deliveryController');
const { getMeRestaurant, deleteMeRestaurant, updateMeRestaurant, uploadUserPhoto} = require('../controllers/auth/restaurantController');
const { getMeAdmin, adminDeleteDelivery, adminDeleteRestaurant, adminDeleteUser, adminGetAllDelivery, adminGetAllRestaurant, adminUpdateRestaurant, adminGetAllUsers, adminGetDelivery, adminGetRestaurant, adminUpdateUser, adminUpdateDelivery, adminGetUser} = require('../controllers/auth/adminController');
const {signupUser, loginAdmin, signupAdmin, loginDelivery, loginRestaurant, loginUser, signupDelivery, signupRestaurant, logout, forgotPassword, resetPassword, updatePassword, protect, restrictTo} = require('../controllers/auth/authController');
const Admin = require('./../models/auth/adminModel');
const User = require('./../models/auth/userModel');
const Delivery = require('./../models/auth/deliveryModel');
const Restaurant = require('./../models/auth/restaurantModel');

const router = Router();
//  Authentication Controller
router.post('/admin/signup', signupAdmin);
router.post('/user/signup', signupUser);
router.post('/restaurant/signup', signupRestaurant);
router.post('/delivery/login', loginDelivery);
router.post('/restaurant/login', loginRestaurant);
router.post('/user/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/logout', logout);


// Delivery Controller
router.patch('/delivery/updateMyPassword', protect(Delivery), restrictTo('delivery'), updatePassword);
router.get('/delivery/getMe', protect(Delivery), restrictTo('delivery'), getMeDelivery);
router.patch('/delivery/updateMe', protect(Delivery), restrictTo('delivery'), updateMeDelivery);
router.patch('/delivery/resetPassword/:token', resetPassword);
router.post('/delivery/forgotPassword', forgotPassword);



// User Controller
router.get('/user/me', protect(User), restrictTo('user'), getMe);
router.patch('/user/updateMe', protect(User), restrictTo('user'), updateMe);
router.delete('/user/deleteMe', protect(User), restrictTo('user'), deleteMe);

// Restaurant Controller
router.get('/restaurant/getMe', protect(Restaurant), restrictTo('restaurant'), getMeRestaurant);
router.patch('/restaurant/updateMe', protect(Restaurant), restrictTo('restaurant'), updateMeRestaurant);
router.delete('/restaurant/deleteMe', protect(Restaurant), restrictTo('restaurant'), deleteMeRestaurant);
router.post('/restaurant/createDelivery', protect(Restaurant), restrictTo('restaurant'), signupDelivery);
router.delete('/restaurant/deleteMeDelivery', protect(Restaurant), restrictTo('restaurant'), deleteMeDelivery);


router.use(protect(Admin), restrictTo('admin'));

router.get('/admin/getMe', getMeAdmin);

router.get('/admin/user', adminGetAllUsers);
router.get('/admin/restaurant', adminGetAllRestaurant);
router.get('/admin/delivery', adminGetAllDelivery);

router
    .route('/admin/user/:id')
    .get(adminGetUser)
    .patch(adminUpdateUser)
    .delete(adminDeleteUser);
router
    .route('/admin/restaurant/:id')
    .get(adminGetRestaurant)
    .patch(adminUpdateRestaurant)
    .delete(adminDeleteRestaurant);
router
    .route('/admin/delivery/:id')
    .get(adminGetDelivery)
    .patch(adminUpdateDelivery)
    .delete(adminDeleteDelivery);

module.exports = router;