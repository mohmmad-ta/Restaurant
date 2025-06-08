const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            trim: true,
            maxlength: [30, 'A product name must have less or equal then 30 characters'],
            minlength: [3, 'A product name must have more or equal then 4 characters']
        },
        description: {
            type: String,
            require: true,
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function(val) {
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
        imageCover: {
            type: String,
            require: [true, 'A product must have a cover image']
        },
        images: [String],
        sizes: {
            type: Number,
        },
        type: String,
        createAt:{
            type: Date,
            default: Date.now(),
            select: false
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);



module.exports = mongoose.model('Tree', treeSchema);