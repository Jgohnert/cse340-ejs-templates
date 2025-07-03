const accountModel = require("../models/account-model");

const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
//  creates and opens an anonymous function and assigns it to the "registrationRules" property of the "validate" object.
validate.registationRules = () => {
    // opening of the array of checks for the incoming data.
    return [
      // firstname is required and must be string
      //  looks inside the HTTPRequest body for a name - value pair, where the name is "account_firstname". 
      body("account_firstname")
        .trim() //used to remove whitespace (empty characters) on either side of the incoming string.
        .escape() //finds any special character and transform it to an HTML Entity rendering it not operational as code.
        .notEmpty() //is a validatator ensuring that a value exists.
        .isLength({ min: 1 }) //is a validatator checking for a specified length requirement.
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."), // on error this message is sent.

  // valid email is required and cannot already exist in the DB
      body("account_email")
        .trim()
        .isEmail() //checks the string for characters that should be present in a valid email address.
        .normalizeEmail() // makes the email all lowercase, as well as additional alterations to "canonicalize" an email.
        .withMessage("A valid email is required.")
        //creates a "custom" check. Within the custom check an asyncronous, arrow function is created and the "account_email" variable is a parameter.
        .custom(async (account_email) => {
            //calling the function from the model and collecting the value returned (should be 0 or 1)
            const emailExists = await accountModel.checkExistingEmail(account_email)
            // an "if" control structure to check the result. Remember that "0" is FALSE, while any other value is TRUE.
            if (emailExists){
            // throws an error and an error message indicating the email already exists and cannot be reused if the row count is 1.
            //applies only if the email exists.
            throw new Error("Email exists. Please log in or use different email")
          }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        // is a function for checking a password string to meet specific requirements to be considered a strong password.
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

/*  **********************************
  *  login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
    return [
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() 
        .withMessage("A valid email is required."),

      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

/*  **********************************
  *  Updated account Validation Rules
  * ********************************* */
validate.updateAccountRules = () => {
    return [
      body("account_firstname")
        .trim() 
        .escape() 
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), 
  
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."),

      body("account_email")
        .trim()
        .notEmpty()
        .isEmail()
        .withMessage("A valid email is required.")
        .bail() // This stops the validation here if the email is invalid
        .normalizeEmail()
        .custom(async (account_email, {req}) => {
          // The hidden email in the form. It holds the original email
          const currentEmail = req.body.current_email
          // checks if the email exists only if the updated email (account_email) was changed 
          // from the original email (currentEmail)
          if (account_email !== currentEmail) {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
              throw new Error("Email already exists. Try a different email or use your existing email.")
            }
          }
          return true
        }),
    ]
}

/*  **********************************
  *  Change password Rules
  * ********************************* */
validate.passwordChangeRules = () => {
    return [
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements.")
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
// use JavaScript destructuring method to collect and store the firstname, lastname and email address 
// values from the request body. Notice that the password is not stored. These variables will be used to 
// re-populate the form if errors are found. Best practice is to make the client redo the password. So, 
// the password value will NOT be returned.
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  // calls the express-validator "validationResult" function and sends the request object 
  // (containing all the incoming data) as a parameter. All errors, if any, will be stored into the errors array.
  errors = validationResult(req)
  // checks the errors array to see if any errors exist. Notice the "!" which inverts the test, meaning errors IS NOT empty.
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    //calls the render function to rebuild the registration view.
    res.render("account/register", {
      //sends these items back to the view.
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  // the "next()" function is called, which allows the process to continue into the controller for the registration to be carried out.
  next()
}

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLogRegData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to update account form
 * ***************************** */
validate.checkUpdatedAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Edit Account",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
    return
  }
  next()
}

/* ******************************
 * Check password and return errors or continue to update account form
 * ***************************** */
validate.checkUpdatedPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  let errors = []
  errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    // populates the update account form to keep it sticky in case of a change password error.
    const result = await accountModel.getUserByAccountId(account_id)
    const user = result[0]

    res.render("account/update-account", {
      title: "Edit Account",
      nav,
      errors,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      account_id: user.account_id
    })
    return
  }
  next()
}

module.exports = validate
