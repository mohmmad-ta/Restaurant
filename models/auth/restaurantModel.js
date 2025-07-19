const mongoose = require('mongoose');

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
            select: false
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


restaurantSchema.pre(/^find/, function (next) {
    this.find({active: {$ne: false}})
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


const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant