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
const axios = require('axios');

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
exports.signupUser = catchAsync(async (req, res, next) => {
    const { phone, name, password } = req.body;
    const user = await User.create({
        name:name,
        phone:phone,
        password: password,
        passwordConfirm: password,
    });
    createSendToken(user, 201, res);
});

// *** To create new Restaurant ***
exports.signupRestaurant = catchAsync(async (req, res, next)=>{
    const restaurant = await Restaurant.create({
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password,
        passwordConfirm: req.body.password,
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
    const { phone, password } = req.body;
    if (!phone || !password) {
        return next(new AppError('يرجى إدخال رقم الهاتف وكلمة المرور!', 400));
    }
    const user = await User.findOne({ phone }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('رقم الهاتف أو كلمة المرور غير صحيحة!', 401));
    }

    createSendToken(user, 200, res);
});

// *** To login Restaurant ***
exports.loginRestaurant = catchAsync(async (req, res, next) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return next(new AppError('يرجى إدخال رقم الهاتف وكلمة المرور!', 400));
    }
    const user = await Restaurant.findOne({ phone }).populate('delivery').select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('رقم الهاتف أو كلمة المرور غير صحيحة!', 401));
    }

    createSendToken(user, 200, res);
});

// *** To login Delivery ***
exports.loginDelivery = catchAsync(async (req, res, next) => {
    const { userID, password } = req.body;
    if (!userID || !password) {
        return next(new AppError('يرجى إدخال اسم المستخدم وكلمة المرور!', 400));
    }
    const user = await Delivery.findOne({ userID }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('اسم المستخدم أو كلمة المرور غير صحيحة!', 401));
    }

    createSendToken(user, 200, res);
});

// *** To login Admin ***
exports.loginAdmin = catchAsync(async (req, res, next) => {
    const { userID, password } = req.body;
    if (!userID || !password) {
        return next(new AppError('يرجى إدخال اسم المستخدم وكلمة المرور!', 400));
    }
    const user = await Admin.findOne({ userID }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('اسم المستخدم أو كلمة المرور غير صحيحة!', 401));
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
        return next(new AppError('أنت غير مسجل الدخول! يرجى تسجيل الدخول للوصول.', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await Model.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('المستخدم المرتبط بهذا التوكن لم يعد موجودًا.', 401));
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

// *** User authorization ***
exports.restrictTo = (...roles)=>{
    return (req, res, next)=>{
        if (!roles.includes(req.user.role)){
            return next(new AppError('ليس لديك الصلاحية لتنفيذ هذا الإجراء', 403));
        }
        next()
    }
}

// *** if user forgot Password ***
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('لا يوجد مستخدم بهذا البريد الإلكتروني.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `هل نسيت كلمة المرور؟ أرسل طلب PATCH مع كلمة مرور جديدة إلى: ${resetURL}.\nإذا لم تطلب إعادة تعيين كلمة المرور، فتجاهل هذه الرسالة.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'رمز إعادة تعيين كلمة المرور (صالح لمدة 10 دقائق)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('حدث خطأ أثناء إرسال البريد الإلكتروني. حاول مرة أخرى لاحقًا!', 500));
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
        return next(new AppError('الرمز غير صالح أو انتهت صلاحيته', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
});

// *** To update user password ***
exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordConfirm, user.password))) {
        return next(new AppError('كلمة المرور الحالية غير صحيحة.', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.password;
    await user.save();
    createSendToken(user, 200, res);
});
