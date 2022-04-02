//const userModel = require("../models/userModel")
const bookModel = require("../models/bookModels")
const reviewModel = require("../models/reviewModel")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.toString().trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// create review.....................................................................

const createReview = async function (req, res) {
    try {
        const data = req.body;
        const bookId = req.params.bookId

        if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }) }
        const { reviewedBy, reviewedAt, rating, review } = data;

        if (!(isValid(bookId) || isValidObjectId(bookId))) {
            return res.status(400).send({ status: false, message: "bookId is not valid" })
        }
        if (!(isValid(req.body.bookId) || isValidObjectId(req.body.bookId))) {
            return res.status(400).send({ status: false, message: "bookId is not valid" })
        }
        if (req.body.bookId != bookId) { return res.status(400).send({ status: false, message: "Please provide same booksIds in path params and request body" }) }


        let bookDetail = await bookModel.findOne({ _id: bookId, isDeleted: false });

        if (!bookDetail) { return res.status(400).send({ status: false, message: "book does not exists" }) }

        if (!isValid(reviewedBy)) { return res.status(400).send({ status: false, message: "reviewedBy is required " }) }

        if (!isValid(reviewedAt)) { return res.status(400).send({ status: false, message: "reviewedAt is required" }) }

        if (!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(reviewedAt)) {
            return res.status(400).send({ status: false, message: "Date should be in the format YYYY-MM-DD and it should be in digit" })
        }


        if (!isValid(review)) { return res.status(400).send({ status: false, message: "please provide valid review" }) }

        if (!isValid(rating)) { return res.status(400).send({ status: false, message: "rating is not valid " }) }

        if (!/^[1-5]$/.test(rating)) {
            return res.status(400).send({ status: false, message: "Rating should be between 1-5" })
        }
        const newReviewData = await reviewModel.create(data)

        const reviewData = {
            _id: newReviewData._id,
            bookId: bookId,
            reviewedBy: newReviewData.reviewedBy,
            reviewedAt: newReviewData.reviewedAt,
            rating: newReviewData.rating,
            reviews: newReviewData.review,

        }
        let increasedreview = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: +1 } }, { new: true })

        res.status(201).send({ status: true, message: "Thanks for reviewing this book..!!", data: reviewData })

    } catch (error) {

        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports.createReview = createReview


//update...........................................................

const updateReview = async function (req, res) {
    try {
        let data = req.body
        if (!isValid(data)) return res.status(400).send({ status: false, Message: "Please provide the data..!!" });
        if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid review format" }) }

        let bookIdUpdating = req.params.bookId

        if (!(isValid(bookIdUpdating) && isValidObjectId(bookIdUpdating))) {
            return res.status(400).send({ status: false, message: "bookId is not valid" })
        }

        let bookIdPresent = await bookModel.findOne({ _id: bookIdUpdating, isDeleted: false });

        if (!bookIdPresent) { return res.status(400).send({ status: false, message: "book does not exists" }) }

        let reviewId = req.params.reviewId
        if (!(isValid(reviewId) || isValidObjectId(reviewId))) {
            return res.status(400).send({ status: false, message: "reviewId is not valid" })
        }

        if (!/^[1-5]$/.test(data.rating)) {
            return res.status(400).send({ status: false, message: "Rating should be between 1-5" })
        }


        let reviewIdPresent = await reviewModel.findOne({ _id: reviewId, bookId: bookIdUpdating, isDeleted: false });

        if (!reviewIdPresent) { return res.status(400).send({ status: false, message: "No review for this book" }) }

        let updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookIdUpdating, isDeleted: false }, { $set: { reviews: data.reviews, rating: data.rating, reviewedBy: data.reviewername } }, { new: true })

        const addingReview = {
            _id: bookIdPresent._id,
            title: bookIdPresent.title,
            excerpt: bookIdPresent.excerpt,
            userId: bookIdPresent.userId,
            category: bookIdPresent.category,
            subcategory: bookIdPresent.subcategory,
            isDeleted: bookIdPresent.isDeleted,
            reviews: bookIdPresent.reviews,
            isDeleted: bookIdPresent.isDeleted,
            releasedAt: bookIdPresent.releasedAt,
            updatedReview
        }
        if (updatedReview != null) { return res.status(200).send({ Status: true, data: addingReview }) }

        else {

            return res.status(400).send({ Status: false, data: "either it is deleted or bookID and reviewedId doesn't match" })
        }


    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }

}

module.exports.updateReview = updateReview


//delete................................................

const deleteReview = async function (req, res) {
    try {

        let reviewedBookId = req.params.bookId
        if (!(isValid(reviewedBookId) && isValidObjectId(reviewedBookId))) {
            return res.status(400).send({ status: false, message: "Book id is invalid" })
        }

        const findBookById = await bookModel.findOne({ _id: reviewedBookId, isDeleted: false })

        if (!findBookById) {
            return res.status(404).send({ status: false, message: "No Book Available for this Id" })
        }

        let deleteReviewId = req.params.reviewId
        if (!(isValid(reviewedBookId) && isValidObjectId(deleteReviewId))) {
            return res.status(400).send({ status: false, message: "review id is invalid" })
        }


        const findReview = await reviewModel.findOne({ _id: deleteReviewId, bookId: reviewedBookId, isDeleted: false })

        if (!findReview) {
            return res.status(404).send({ status: false, message: "No review Available for this book" })
        }



        const deleteReviewData = await reviewModel.findOneAndUpdate({ _id: deleteReviewId },
            { $set: { isDeleted: true } },
            { new: true })


        let deleteReview = await bookModel.findOneAndUpdate({ _id: findBookById._id }, { $inc: { reviews: -1 } })

        if (deleteReviewData != 0) { return res.status(200).send({ status: true, message: "review deleted successfullly." }) }


    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }


}

module.exports.deleteReview = deleteReview