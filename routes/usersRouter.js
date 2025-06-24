const {Router} = require('express');
const {getAllUsers, createUser, deleteUser, updateUser, updateMe, deleteMe, getUser, getMe, uploadUserPhoto} = require('./../controllers/userController');
const {signupUser, loginDelivery, loginRestaurant, loginUser, signupDelivery, signupRestaurant, logout, forgotPassword, resetPassword, updatePassword, protect, restrictTo} = require('./../controllers/authController');


const router = Router();
//  Authentication Controller
router.post('/signupUser', signupUser);
router.post('/signupDelivery', signupDelivery);
router.post('/signupRestaurant', signupRestaurant);
router.post('/loginDelivery', loginDelivery);
router.post('/loginRestaurant', loginRestaurant);
router.post('/loginUser', loginUser);
router.get('/logout', logout);

router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/forgotPassword', forgotPassword);

// Delivery Controller
// Restaurant Controller
// User Controller
router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);


router.use(restrictTo('admin'));
router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;