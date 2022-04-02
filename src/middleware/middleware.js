const jwt = require('jsonwebtoken')
const bookModel = require("../models/bookModels")


//Authentication................................................................

const authentication = function (req, res, next) {
    try {
        const token = req.headers["x-api-key"]
        if (!token) {
            return res.status(400).send({ status: false, message: "token must be present" });
        }
        const decodedToken = jwt.verify(token, "Book_Management_Key");

        if (!decodedToken) {
            return res.status(401).send({ status: false, message: "token is invalid" });
        }

        next();
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }

}


//Authorization.....................................................................

let authorization = async function (req, res, next) {

    try {
        let token = req.headers["x-api-key"]
        if (!token) { return res.status(400).send({ status: false, message: "token must be present" }) }

        let decodedToken = jwt.verify(token, "Book_Management_Key")

        if (!decodedToken) {
            return res.status(401).send({ status: false, msg: "token is invalid" });
        }

        let decodedUserId = decodedToken.userId
        let bookIdParams = req.params.bookId

        let bookDetailsId = await bookModel.findOne({ _id: bookIdParams, isDeleted: false })
        if (!bookDetailsId) {
            return res.status(401).send({ status: false, msg: "no data found with this Id" });
        }

        let bookUserId = bookDetailsId.userId

        if (decodedUserId != bookUserId) { return res.status(403).send({ status: false, message: "You are not an authorized person to make these changes" }) }
        next()
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ msg: error.message })
    }
}


module.exports.authorization = authorization
module.exports.authentication = authentication