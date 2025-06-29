const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
        role: {
            type: String,
            enum: ['user'],
            default: 'user'
        },
        active: {
            type: Boolean,
            default: true,
            select: false
        },
        location: {
            work: Object,
            home: Object,
            other: Object
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


userSchema.pre(/^find/, function (next) {
    this.find({active: {$ne: false}})
    next()
})


const User = mongoose.model('User', userSchema);
module.exports = User