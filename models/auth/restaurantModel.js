const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const restaurantSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Please tell us your name!'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [3, 'A tour name must have more or equal then 3 characters']
        },
        phone: {
            type: String,
            trim: true,
            required: [true, 'Please tell us your phone number!'],
        },
        discount: {
            type: Number,
            trim: true,
            default: 0
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10
        },
        image: {
            type: String,
            default: 'http://localhost:7060/public/images/users/user.png'
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
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function(el) {
                    return el === this.password;
                },
                message: 'Passwords are not the same!'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


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