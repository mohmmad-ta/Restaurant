const mongoose = require('mongoose');
const slugify = require('slugify');

const mealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A Meal must have a name'],
            trim: true,
            maxlength: [40, 'A Meal name must have less or equal then 40 characters'],
            minlength: [3, 'A Meal name must have more or equal then 3 characters'],
        },
        slug: String,
        price: {
            type: Number,
            required: [true, 'A Meal must have a price']
        },
        description: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            // required: [true, 'A Meal must have a image']
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        restaurantId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant'
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// tourSchema.index({ price: 1 });
mealSchema.index({ price: 1, ratingsAverage: -1 });
mealSchema.index({ slug: 1 });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
mealSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

mealSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;