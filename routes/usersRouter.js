const {Router} = require('express');
const {getAllUsers, createUser, deleteUser, updateUser, updateMe, deleteMe, getUser, getMe, uploadUserPhoto} = require('./../controllers/userController');
const {signup, login, logout, forgotPassword, resetPassword, updatePassword, protect, restrictTo} = require('./../controllers/authController');


const router = Router();
//  Authentication Controller
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

router.patch('/updateMyPassword', protect, updatePassword);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

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