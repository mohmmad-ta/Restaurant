const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        item: [
            {
                Id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Meal',
                    required: [true, 'يرجى إدخال رقم الوجبة'],
                },
                count: {
                    type: Number,
                    required: [true, 'يرجى إدخال عدد الوجبات'],
                }
            }
        ],
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'يرجى إدخال رقم المستخدم'],
        },
        deliveryId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Delivery'
        },
        restaurantId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant',
            required: [true, 'يرجى إدخال رقم المطعم'],
        },
        location: {
            type: Object,
            required: [true, 'يرجى إدخال الموقع'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        status: {
            type: String,
            enum: ['1', '2', '3', '4'],
            default: '1'
        },
        totalPrice: {
            type: Number,
            default: 0
        }
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
        select: '-__v -location -role'
    }).populate({
        path: 'item.Id',
        select: '-__v -role'
    }).populate({
        path: 'deliveryId',
        select: '-__v -role'
    });

    next();
});
orderSchema.pre('save', async function (next) {
    if (!this.isModified('item')) return next();
    // Populate meals and restaurant to get price and discount

    await this.populate('item.Id');
    await this.populate('restaurantId'); // Make sure it has discount info

    console.log(this.restaurantId)
    let total = 0;

    for (const el of this.item) {
        if (el?.Id?.price) {
            total += el.Id.price * el.count;
        }
    }

    let discount = this.restaurantId?.discount || 0;
    discount = discount /100;
    const discountAmount = (total * discount);
    console.log('discountAmount', discountAmount, 'total', total, "discount", discount);

    this.totalPrice = total - discountAmount;

    next();
});



const Order = mongoose.model('Order', orderSchema);

module.exports = Order;