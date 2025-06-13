const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  // retrieves and stores the navigation bar string for use in the view.
  let nav = await utilities.getNav()
  // calls the render function and indicates the view to be returned to 
  // the client and opens the object that will carry data to the view.
  res.render("account/login", {
    // the data items to be sent to the view.
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  // retrieves and stores the navigation bar string for use in the view.
  let nav = await utilities.getNav()
  // collects and stores the values from the HTML form that are being 
  // sent from the browser in the body of the request object.
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    // calls the "bcrypt.hashSync() function, using "await" and stores the resulting hash 
    // into the variable created on line 2. The function accepts the plain text password 
    // and a "saltRounds" value as parameters. [A saltRound is an integer indicating how 
    // many times a hash will be resent through the hashing algorithim.
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    // creates a flash message indicating the registration failed.
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    // will return the registration view.
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  // calls the function, from the model, and uses the "await" keyword 
  // to indicate that a result should be returned and wait until it arrives. 
  // The result is stored in a local variable.
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // opens an "if" structure to determine if a result was received.
  if (regResult) {
    // sets a flash message to be displayed.
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    // calls the render function to return the login view, along with an HTTP 
    // 201 status code for a successful insertion of data.
    res.status(201).render("account/login", {
      // data within the data object being sent to the view.
      title: "Login",
      nav,
    })
  } else {
    // sets the failure message if the insertion failed.
    req.flash("notice", "Sorry, the registration failed.")
    // calls the render function, sends the route to trigger a return to the 
    // registration view and sends a HTTP 501 status code. In this instance, 
    // the 501 status should be interpreted as "not successful".
    res.status(501).render("account/register", {
      // The elements of the data object being sent to the view.
      title: "Registration",
      nav,
    })
  }
}

//exports the function for use elsewhere.
module.exports = { buildLogin, buildRegister, registerAccount }
