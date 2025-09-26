const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const restaurantSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'يرجى إدخال اسم المطعم'],
            unique: true,
            trim: true,
            maxlength: [40, 'اسم المطعم يجب ألا يزيد عن 40 حرفًا'],
            minlength: [3, 'اسم المطعم يجب ألا يقل عن 3 أحرف']
        },
        phone: {
            type: String,
            trim: true,
            unique: [true, 'رقم الهاتف مسجل مسبقًا'],
            required: [true, 'يرجى إدخال رقم الهاتف']
        },
        discount: {
            type: Number,
            trim: true,
            enum: [0, 10, 20, 30, 40, 50],
            default: 0
        },
        ratingsAverage: {
            type: Number,
            default: 1,
            min: [1, 'التقييم يجب أن يكون أكبر من 1.0'],
            max: [5, 'التقييم يجب أن يكون أقل من 5.0'],
            set: (val) => Math.round(val * 10) / 10, // round to 1 decimal
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
            default: 'https://restaurant.khaleeafashion.com/public/images/users/user.png'
        },
        role: {
            type: String,
            enum: ['restaurant'],
            default: 'restaurant'
        },
        active: {
            type: Boolean,
            default: true,
        },
        deleted: {
            type: Boolean,
            default: false,
            select: false
        },
        password: {
            type: String,
            required: [true, 'يرجى إدخال كلمة المرور'],
            minlength: [8, 'كلمة المرور يجب ألا تقل عن 8 أحرف'],
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'يرجى تأكيد كلمة المرور'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'كلمتا المرور غير متطابقتين!'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });



restaurantSchema.pre(/^find/, function (next) {
    this.find({deleted: {$ne: true}})
    next()
})
restaurantSchema.virtual('delivery', {
    ref: 'Delivery',
    foreignField: 'restaurantId',
    localField: '_id'
});
restaurantSchema.virtual('meal', {
    ref: 'Meal',
    foreignField: 'restaurantId',
    localField: '_id'
});

restaurantSchema.pre('save',  async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
})

restaurantSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

restaurantSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

restaurantSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

restaurantSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant