const {Router} = require('express');
const { getMeDelivery, updateMeDelivery, deleteMeDelivery} = require('../controllers/auth/deliveryController');
const { getMeRestaurant, deleteMeRestaurant, updateMeRestaurant} = require('../controllers/auth/restaurantController');
const { getAllMeals, createMeal, deleteMeal, getMeal, updateMeal, getAllMyMeals} = require('../controllers/mealController');
const {protect, restrictTo} = require('../controllers/auth/authController');
const User = require('./../models/auth/userModel');
const Delivery = require('./../models/auth/deliveryModel');
const Restaurant = require('./../models/auth/restaurantModel');

const router = Router();

router.get('/', getAllMeals);
router.get('/:id', getMeal);

// Restaurant Controller
router.get('/restaurant/MyMeals', protect(Restaurant), restrictTo('restaurant'), getAllMyMeals);
router.post('/restaurant/createMeal', protect(Restaurant), restrictTo('restaurant'), createMeal);
router.delete('/restaurant/deleteMeal/:id', protect(Restaurant), restrictTo('restaurant'), deleteMeal);
router.patch('/restaurant/updateMeal/:id', protect(Restaurant), restrictTo('restaurant'), updateMeal);


module.exports = router;