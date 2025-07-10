const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        item: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Meal',
                count : Number,
                required: true
            }
        ],
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        deliveryId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Delivery'
        },
        restaurantId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        status: {
            type: String,
            enum: ['1', '2', '3', '4'],
            default: '1'
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

orderSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'restaurantId',
        select: '-__v -slug'
    }).populate({
        path: 'userId',
        select: '-__v -role'
    }).populate({
        path: 'item',
        select: '-__v -restaurantId -role'
    });

    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;