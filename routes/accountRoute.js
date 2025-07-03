const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const validation = require('../utilities/account-validation');

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/logout", utilities.handleErrors(accountController.logoutUser));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.get(
  "/", 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
);

router.get(
  "/account-management", 
  utilities.checkAccountType,
  utilities.handleErrors(accountController.buildAccountManagement)
);

router.get("/update/:account_id", utilities.handleErrors(accountController.modifyAccountView));


// Process the registration data
router.post(
  //The path being watched for in the route.
  "/register",
  //The function containing the rules to be used in the validation process.
  validation.registationRules(),
  //The call to run the validation and handle the errors, if any.
  validation.checkRegData,
  //The call to the controller to handle the registration, if no errors occur in the validation process.
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  validation.loginRules(),
  validation.checkLogRegData,
  // utilities.handleErrors(accountController.buildLogin),
  // process the login request.
  utilities.handleErrors(accountController.accountLogin)
)

// Route when the user's updated data is successful
router.post(
  "/update-account", 
  validation.updateAccountRules(),
  validation.checkUpdatedAccountData,
  utilities.handleErrors(accountController.updateAccount),
);

// Route when the user's password is successfully changed
router.post(
  "/update-password",
  validation.passwordChangeRules(),
  validation.checkUpdatedPasswordData,
  utilities.handleErrors(accountController.updatePassword),
);



module.exports = router;
