const jwt = require('jsonwebtoken')
const Admin = require('../../models/auth/adminModel');
const User = require('../../models/auth/userModel');
const Delivery = require('../../models/auth/deliveryModel');
const Restaurant = require('../../models/auth/restaurantModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require("../../utils/appError");
const {promisify} = require("util");
const crypto = require("crypto");
const sendEmail = require("../../utils/email");

// *** jwt token ***
const signToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}
// *** jwt token ***
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user
        }
    });
};
// *** To create new admin ***
exports.signupAdmin = catchAsync(async (req, res, next)=>{
    const user = await Admin.create({
        userID: 'mohammed',
        password: '12345678',
        passwordConfirm: '12345678',
    });
    createSendToken(user, 201, res);
})
// *** To create new user ***
exports.signupUser = catchAsync(async (req, res, next)=>{
    const user = await User.create({
        name: req.body.name,
        phone: req.body.phone,
        location: req.body.location,
    });
    createSendToken(user, 201, res);
})
// *** To create new  Restaurant ***
exports.signupRestaurant = catchAsync(async (req, res, next)=>{
    const restaurant = await Restaurant.create({
        name: req.body.name,
        phone: req.body.phone,
        photo: req.body.photo,
    });
    createSendToken(restaurant, 201, res);
})
// *** To create new Delivery ***
exports.signupDelivery = catchAsync(async (req, res, next)=>{
    const delivery = await Delivery.create({
        name: req.body.name,
        userID: req.body.userID,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        restaurantId: req.user.id,
        phone: req.body.phone,
    });
    res.status(200).json({
        status: 'success',
        data: {
            user: delivery
        }
    });
})
// *** To user login ***
exports.loginUser = catchAsync(async (req, res, next) => {
    const { phone } = req.body;
    if (!phone) {
        return next(new AppError('Please provide phone and password!', 400));
    }
    const user = await User.findOne({ phone }).select('+password');

    if (!user ) {
        return next(new AppError('Incorrect phone or password', 401));
    }

    createSendToken(user, 200, res);
});
// *** To  login Restaurant ***
exports.loginRestaurant = catchAsync(async (req, res, next) => {
    const { phone } = req.body;
    if (!phone ) {
        return next(new AppError('Please provide phone and password!', 400));
    }
    const user = await Restaurant.findOne({ phone }).select('+password').populate('delivery')

    if (!user) {
        return next(new AppError('Incorrect phone or password', 401));
    }

    createSendToken(user, 200, res);
});
// *** To login Delivery ***
exports.loginDelivery = catchAsync(async (req, res, next) => {
    const { userID, password } = req.body;
    if (!userID || !password) {
        return next(new AppError('Please provide userID and password!', 400));
    }
    const user = await Delivery.findOne({ userID }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect userID or password', 401));
    }

    createSendToken(user, 200, res);
});
// *** To login Admin ***
exports.loginAdmin = catchAsync(async (req, res, next) => {
    const { userID, password } = req.body;
    if (!userID || !password) {
        return next(new AppError('Please provide userID and password!', 400));
    }
    const user = await Admin.findOne({ userID }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect userID or password', 401));
    }

    createSendToken(user, 200, res);
});
// *** To Protecting Routes ***
exports.protect = Model => catchAsync(async (req, res, next) => {
    let token ;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(Model);
    const currentUser = await Model.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});
// *** To user logout ***
exports.logout = catchAsync(async (req, res, next)=>{
    res.cookie('jwt', null);
    res.cookie('id', null);
    res.status(201).json({
        status: 'success',
    })
})
// ***  User authorization ***
exports.restrictTo = (...roles)=>{
    return (req, res, next)=>{
        if (!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next()
    }
}

// *** if user forgot Password ***
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }
});

// *** To reset user Password ***
exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordConfirm, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user, 200, res);
});