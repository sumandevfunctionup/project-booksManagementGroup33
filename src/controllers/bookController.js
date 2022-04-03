const userModel = require("../models/userModel")
const bookModel = require("../models/bookModels")
const mongoose = require("mongoose")
const reviewModel = require("../models/reviewModel")
const ObjectId = require("mongoose").Types.ObjectId

//validation.......................................................................
const isValid = function (value) {
  if (typeof value == undefined || value == null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  if (typeof value === 'Number' && value.toString().trim().length === 0) return false
  return true
}

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId)
}





      
// create books.....................................................................

const createBook = async function (req, res) {
  try {
    const data = req.body;
   
    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }) }
    const { title, excerpt, userId, ISBN, category, subcategory,bookCover, reviews, isDeleted, releasedAt } = data;
    if (!isValid(title)) { return res.status(400).send({ status: false, message: 'Book Title is required' }) }

    const bookTitle = await bookModel.findOne({ title });
    if (bookTitle) { return res.status(400).send({ status: false, message: "Title  already registered" }) }


    if (!isValid(excerpt)) { return res.status(400).send({ status: false, message: 'excerpt is required' }) }

    if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: 'userId is required' }) }

    if (!isValid(ISBN)) { return res.status(400).send({ status: false, message: "ISBN is not a valid" }) }
    if (!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN.trim()))) {
      return res.status(400).send({ status: false, ERROR: "ISBN is not valid" })
    }

    const bookISBN = await bookModel.findOne({ ISBN });
    if (bookISBN) { return res.status(400).send({ status: false, message: "ISBN  already registered" }) }

    if (!isValid(category)) { return res.status(400).send({ status: false, message: 'Book category is required' }) }
    if (!isValid(subcategory)) { return res.status(400).send({ status: false, message: 'Book subcategory is required' }) }
    if (!isValid(releasedAt)) { return res.status(400).send({ status: false, message: ' Please provide a valid ReleasedAt date' }) }


    if (!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(releasedAt)) {
      return res.status(400).send({ status: false, message: "\"YYYY-MM-DD\" this Date format & only number format is accepted " })
    }


    const userDetails = await userModel.findById(userId);
    if (!userDetails) { return res.status(400).send({ status: false, message: "User does not exists" }) }

    const newBookData = await bookModel.create(data)
    const bookData = {
      _id: newBookData._id,
      title: newBookData.title,
      excerpt: newBookData.excerpt,
      userId: newBookData.userId,
      ISBN: newBookData.ISBN,
      bookCover: newBookData.bookCover,
      category: newBookData.category,
      subcategory: newBookData.subcategory,
      bookCover:newBookData.bookCover,
      reviews: newBookData.reviews,
      releasedAt: newBookData.releasedAt
    }
    res.status(201).send({ status: true, message: ' book Data created successfully', data: bookData })

  } catch (error) {
    console.log(error)
    res.status(500).send({ status: false, message: error.message });
  }
}
module.exports.createBook = createBook



//getbooks...........................................................

const getBooks = async function (req, res) {

  try {
    const filters = req.query
    console.log(filters)
    if (Object.keys(filters).length > 0) {

      const availableBooks = await bookModel.find({ $and: [filters, { isDeleted: false }] }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

      if (!availableBooks.length > 0) {
        return res.status(404).send({ status: false, message: "No Book Found For Given info" })
      }

      availableBooks.sort(function (first, last) {
        return first.title.localeCompare(last.title);
      })

      return res.status(200).send({ status: true, message: "book  list", data: availableBooks })
    }
    else {
      const allBooks = await bookModel.find()
      return res.status(200).send({ status: true, message: allBooks })
    }
  }

  catch (err) {
    console.log(err)
    res.status(500).send({ status: "failed", message: err.message })
  }

}

module.exports.getBooks = getBooks


//getBooksByPath......................................................

const getBooksByPath = async function (req, res) {

  try {
    const bookId = req.params.bookId
    if (!(isValid(bookId))) { return res.status(400).send({ status: false, message: "bookId is required" }) }
    if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: "Valid bookId is required" }) }


    const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!book) { return res.status(400).send({ status: false, message: "No data found" }) }


    const addReview = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, reviews: 1 })
    if (!addReview) { return res.status(404).send({ status: false, data: book, message: "No reviews for this book" }) }

    const addingCollege = {
      _id: book._id,
      title: book.title,
      excerpt: book.excerpt,
      userId: book.userId,
      category: book.category,
      subcategory: book.subcategory,
      isDeleted: book.isDeleted,
      reviews: book.reviews,
      isDeleted: book.isDeleted,
      releasedAt: book.releasedAt,
      addReview
    }
    return res.status(200).send({ status: true, message: "Book Data", data: addingCollege })
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ message: err.message })
  }
}

module.exports.getBooksByPath = getBooksByPath



//updated..............................................

const updateBooks = async (req, res) => {

  try {
    const data = req.body
    if (!isValid(data)) return res.status(400).send({ status: false, message: "Please provide the data..!!" });

    const Id = req.params.bookId

    if (!(isValid(Id))) { return res.status(400).send({ status: false, message: "bookId is required" }) }
    if (!isValidObjectId(Id)) { return res.status(400).send({ status: false, message: "Valid bookId is required" }) }

    if (!isValid(data.title)) { return res.status(400).send({ status: false, message: 'Book Title is required' }) }

    const bookTitleNew = await bookModel.findOne({ title: data.title });
    if (bookTitleNew) { return res.status(400).send({ status: false, message: "Title  already registered" }) }

    if (!isValid(data.ISBN)) { return res.status(400).send({ status: false, message: "ISBN is not a valid" }) }
    if (!(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN.trim()))) {
      return res.status(400).send({ status: false, ERROR: "ISBN is not valid" })
    }

    const bookISBNnew = await bookModel.findOne({ ISBN: data.ISBN });
    if (bookISBNnew) { return res.status(400).send({ status: false, message: "ISBN  already registered" }) }


    let ifExist = await bookModel.findOne({ _id: Id, isDeleted: false })

    if (!ifExist) {
      return res.status(400).send({ status: false, message: "Book Not Found" })
    }

    if (ifExist.isDeleted == false) {


      //   let newTitle = data.title
      //   let newExcerpt = data.excerpt
      //   let newDate = data.releasedAt
      //   let isbn = data.ISBN
      //   let newCategory = data.category
      //   let newSubCategory = data.subcategory

      let updatedBook = await bookModel.findByIdAndUpdate({ _id: Id },
        {
          ...data
          // $set: { title: newTitle, excerpt: newExcerpt, releasedAt: newDate, ISBN: isbn, category: newCategory },
          // $push: { subcategory: newSubCategory },
        },
        { new: true })

      return res.status(200).send({ Status: true, data: updatedBook })

    } else {
      return res.status(400).send({ status: false, message: "Data is deleted..!!" })
    }


  } catch (error) {
    res.status(500).send({ status: false, ERROR: error.message })
  }
}

module.exports.updateBooks = updateBooks


//delete..............................................


const deleteBook = async function (req, res) {
  try {
    const bookIdDelete = req.params.bookId;
    if (!isValid(bookIdDelete)) { return res.status(400).send({ status: false, message: "No Data Found" }) }

    if (!isValidObjectId(bookIdDelete)) {
      return res.status(400).send({ status: false, message: "book id is invalid" })
    }


    const findBook = await bookModel.findById({ _id: bookIdDelete })

    if (!findBook) {
      return res.status(404).send({ status: false, message: "No Book Available for this Id" })
    }

    else if (findBook.isDeleted == true) {
      return res.status(400).send({ status: false, messege: "the book is already deleted" })
    }
    else {
      const deleteData = await bookModel.findOneAndUpdate({ _id: bookIdDelete },
        { isDeleted: true, deletedAt: new Date() },
        { new: true }).select({ _id: 1, title: 1, isDeleted: 1, deletedAt: 1 })

      const deleteViewers = await reviewModel.updateMany({ bookId: bookId }, { isDeleted: true }, { new: true })
      return res.status(200).send({ status: true, message: "Book deleted successfullly." })
    }
  }

  catch (err) {
    return res.status(500).send({ status: false, Error: err.message })
  }

}


module.exports.deleteBook = deleteBook











