const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  //The path being watched for in the route.
  "/register",
  //The function containing the rules to be used in the validation process.
  regValidate.registationRules(),
  //The call to run the validation and handle the errors, if any.
  regValidate.checkRegData,
  //The call to the controller to handle the registration, if no errors occur in the validation process.
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogRegData,
  utilities.handleErrors(accountController.buildLogin)
)

module.exports = router;
