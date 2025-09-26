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
                notes: [
                    {
                        title: {
                            type: String,
                        },
                    }
                ],
                tags: [
                    {
                        title: {
                            type: String,
                        },
                        price: {
                            type: Number,
                            default: 0,
                        },
                    }
                ],
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
            enum: ['1', '2', '3', '4'], // 1=new, 2=accepted, 3=delivered, 4=cancelled
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

// Auto populate relations when finding
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

// Calculate total price before saving
orderSchema.pre('save', async function (next) {
    if (!this.isModified('item')) return next();

    // Populate meals and restaurant to get price and discount
    await this.populate('item.Id');
    await this.populate('restaurantId'); // For discount

    let total = 0;

    for (const el of this.item) {
        if (el?.Id?.price) {
            // Base meal price × count
            let basePrice = el.Id.price * el.count;

            // Tags price × count
            let tagsPrice = 0;
            if (el.tags && el.tags.length > 0) {
                tagsPrice = el.tags.reduce((acc, tag) => acc + (tag.price || 0), 0) * el.count;
            }

            total += basePrice + tagsPrice;
        }
    }

    // Apply restaurant discount if available
    let discount = this.restaurantId?.discount || 0;
    discount = discount / 100;
    const discountAmount = total * discount;

    this.totalPrice = total - discountAmount;

    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
