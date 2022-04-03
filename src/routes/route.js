const express = require('express');
const router = express.Router();
const bookController = require("../controllers/bookController")
const userController = require("../controllers/userController")
const reviewController = require("../controllers/reviewController")
const middleware = require("../middleware/middleware")
const aws = require("aws-sdk")


//users..............................................
router.post("/register", userController.createUser)

router.post("/login", userController.login);


//aws.........................................................
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)

let uploadFile = async (file) => {
    return new Promise( function(resolve, reject) {
       
        let s3 = new aws.S3({ apiVersion: "2006-03-01" }) 
        
        var uploadParams = {
            ACL: "public-read",//visibility
            Bucket: "classroom-training-bucket", //folder
            Key: "khushboo/" + file.originalname, //subfolder
            Body: file.buffer
        }

      s3.upload(uploadParams, function (err, data) {
            if (err) { 
                return reject({ "error": err }) 
            }

            console.log(data)
            console.log(" file uploaded succesfully ")
            return resolve(data.Location)
          }
        )

   
    }
    )
}

router.post("/write-file-aws", async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
            
            let uploadedFileURL = await uploadFile(files[0])
            res.status(201).send({ msg: "file uploaded succesfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ msg: "No file found" })
        }
    }
    catch (err) {
        res.status(500).send({ msg: err })
    }
}
)


//book..............................................
router.post("/books",middleware.authentication, bookController.createBook);

router.get("/books",middleware.authentication,bookController.getBooks);

router.get("/books/:bookId",middleware.authentication, bookController.getBooksByPath);

router.put("/books/:bookId", middleware.authentication,middleware.authorization,bookController.updateBooks);

router.delete("/books/:bookId",middleware.authentication,middleware.authorization,bookController.deleteBook)


//review................................................
router.post("/books/:bookId/review", reviewController.createReview);

router.put("/books/:bookId/review/:reviewId", reviewController.updateReview);

router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)


module.exports = router;