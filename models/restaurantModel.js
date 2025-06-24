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
            unique: true,
            trim: true,
            required: [true, 'Please tell us your phone number!'],
        },
        photo: {
            type: String,
            default: 'http://localhost:3000/public/images/users/user.png'
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
        delivery: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Delivery'
            }
        ]
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


const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant