const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")


//validation.....................................................................
const isValid = function (value) {
  if (typeof value == undefined || value == null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  if (typeof value === 'Number' && value.toString().trim().length === 0) return false
  return true
}

const isValidTitle = function (title) {
  return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


//Create user.....................................................................
const createUser = async function (req, res) {
  try {

    let data = req.body;
    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an user" }) }

    if (!isValidTitle(data.title)) { return res.status(400).send({ status: false, message: "Title must be:['Mr', 'Mrs', 'Miss'] " }) }


    if (!isValid(data.name)) { return res.status(400).send({ status: false, message: "Name is required" }) }
    if (!isValid(data.phone)) { return res.status(400).send({ status: false, message: "Phone Number is required" }) }


    if (!(/^[6-9]\d{9}$/.test(data.phone))) {
      return res.status(400).send({ status: false, message: "phone number should be valid number" })
    }

    let checkPhone = await userModel.findOne({ phone: data.phone })
    if (checkPhone) { return res.status(400).send({ message: "phone Already exist" }) }

    if (!isValid(data.email)) { return res.status(400).send({ status: false, message: "Email-Id is required" }) }

    if (!(/^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/.test(data.email.trim()))) {
      return res.status(400).send({ status: false, message: "Email should be a valid email address" })
    }

    let checkEmail = await userModel.findOne({ email: data.email })
    if (checkEmail) { return res.status(400).send({ message: "Email Already exist" }) }

    if (!isValid(data.password)) {
      return res.status(400).send({ status: false, message: "Password is required" })
    }

    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password.trim()))) {
      return res.status(400).send({ status: false, message: "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character" })
    }

    if (!(/^(\d{4}|\d{6})$/.test(data.address.pincode.trim()))) {
      return res.status(400).send({ status: false, message: "Please enter valid Pincode" })
    }

    let savedData = await userModel.create(data)

    return res.status(201).send({ status: true, data: savedData })

  }
  catch (error) {
    res.status(500).send({ status: false, msg: error.message })
  }
}




//login..........................................................................................

const login = async function (req, res) {

  try {
    let data = req.body
    let email = req.body.email;
    let password = req.body.password;
    if (!(Object.keys(data).length > 0)) { return res.status(400).send({ status: false, message: "Invalid request Please provide details of an User" }) }


    if (!isValid(email)) { return res.status(400).send({ status: false, message: "Email-Id is required" }) }

    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
      return res.status(400).send({ status: false, message: "Email should be a valid email address" })
    }

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Password is required" })
    }

    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password))) {
      return res.status(400).send({ status: false, message: "Please Enter Password : Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character" })
    }

    let specificUser = await userModel.findOne({ email: email, password: password });

    if (!specificUser)
      return res.status(404).send({
        status: false,
        logInFailed: "username or the password is not correct",
      });


    let token = jwt.sign(
      {
        userId: specificUser._id,
        batch: "Project3-Book-Management",
        organisation: "FunctionUp",
      },
      "Book_Management_Key", { expiresIn: "24hr" },
    );
    res.header('x-api-key', token);
    return res.status(201).send({ status: true, TOKEN: token });
  }

  catch (err) {
    return res.status(500).send({ ERROR: err.message });
  }


}


module.exports.createUser = createUser
module.exports.login = login