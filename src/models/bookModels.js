const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    excerpt: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: "user",
        // trim:true
    },
    ISBN: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true

    },
    subcategory: {
        type: [String],
        required: true,
        trim: true,

    },

    isDeleted: {
        type: Boolean,
        default: false
    },
    bookCover:{
        type:String
    },

    reviews: {
        type: Number,
        default: 0,
      
    },
    deletedAt: {
        type: Date,

    },
    releasedAt: {
        type: Date,
        required: true,
        default: Date.now()

    },
    
},
    { timestamps: true });

module.exports = mongoose.model('books', bookSchema)
