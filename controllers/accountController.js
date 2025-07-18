const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  // retrieves and stores the navigation bar string for use in the view.
  let nav = await utilities.getNav();
  // calls the render function and indicates the view to be returned to 
  // the client and opens the object that will carry data to the view.
  res.render("account/login", {
    // the data items to be sent to the view.
    title: "Login",
    nav,
    errors: null
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

// /* ****************************************
// *  Deliver account management view
// * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null
  });
}

// /* ****************************************
// *  Delivers the edit reviews view
// * *************************************** */
async function editReviewView (req, res, next) {
  const review_id = parseInt(req.params.rev_id);
  let nav = await utilities.getNav();
  const result = await accountModel.getReviewByReviewId(review_id);
  const itemData = result[0];
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("account/edit-review", {
    title: "Edit Review For " + itemName,
    nav,
    errors: null,
    review_id: itemData.review_id,
    review_text: itemData.review_text,
  });
}

/* ****************************************
*  Return reviews by account_id As JSON. It's for the
*  reviews on the account management view.
* *************************************** */
async function getReviewsJSON(req, res) {
  const account_id = res.locals.accountData.account_id;
    const reviewData = await accountModel.getReviewsByAccountId(account_id);

    if (reviewData[0].review_id) {
      return res.json(reviewData);
      } else {
        next(new Error("No data returned"));
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  // retrieves and stores the navigation bar string for use in the view.
  let nav = await utilities.getNav();
  // collects and stores the values from the HTML form that are being 
  // sent from the browser in the body of the request object.
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    // calls the "bcrypt.hashSync() function, using "await" and stores the resulting hash 
    // into the variable created on line 2. The function accepts the plain text password 
    // and a "saltRounds" value as parameters. [A saltRound is an integer indicating how 
    // many times a hash will be resent through the hashing algorithim.
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    // creates a flash message indicating the registration failed.
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    // will return the registration view.
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  // calls the function, from the model, and uses the "await" keyword 
  // to indicate that a result should be returned and wait until it arrives. 
  // The result is stored in a local variable.
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  // opens an "if" structure to determine if a result was received.
  if (regResult) {
    // sets a flash message to be displayed.
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    // calls the render function to return the login view, along with an HTTP 
    // 201 status code for a successful insertion of data.
    res.status(201).render("account/login", {
      // data within the data object being sent to the view.
      title: "Login",
      nav,
    });
  } else {
    // sets the failure message if the insertion failed.
    req.flash("notice", "Sorry, the registration failed.");
    // calls the render function, sends the route to trigger a return to the 
    // registration view and sends a HTTP 501 status code. In this instance, 
    // the 501 status should be interpreted as "not successful".
    res.status(501).render("account/register", {
      // The elements of the data object being sent to the view.
      title: "Registration",
      nav,
    });
  }
}

// /* ****************************************
//  *  Process login request
//  * ************************************ */
async function accountLogin(req, res) {
  // builds the navigation bar for use in views.
  let nav = await utilities.getNav();
  // collects the incoming data from the request body.
  const { account_email, account_password } = req.body;
  // makes a call to a model-based function to locate data associated with an existing email. Returned data, if any.
  const accountData = await accountModel.getAccountByEmail(account_email);
  // an "if" to test if nothing was returned.
  if (!accountData) {
    // If the variable is empty, a message is set.
    req.flash("notice", "Please check your credentials and try again.");
    // the response object is used to return the login view to the browser.
    res.status(400).render("account/login", {
      // data to be returned to the view.
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return
  }
  try {
    // uses the bcrypt.compare() function which takes the incoming, plain text password 
    // and the hashed password from the database and compares them to see if they match.
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // If the passwords match, then the JavaScript delete function is used to remove 
      // the hashed password from the accountData array.
      delete accountData.account_password;
      // the JWT token is created. The accountData is inserted as the payload. The secret 
      // is read from the .env file. When the token is ready, it is stored into an "accessToken" variable.
      // the token will be given a life of 1 hour, measured in seconds. 3600 seconds.
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      // checks to see if the development environment is "development" (meaning local for testing).
      if(process.env.NODE_ENV === 'development') {
        // If TRUE, a new cookie is created, named "jwt", the JWT token is stored in the cookie, and the 
        // options of "httpOnly: true" and "maxAge: 3600 * 1000" are set. This means that the cookie can 
        // only be passed through the HTTP protocol and cannot be accessed by client-side JavaScript. It will also expire in 1 hour.
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        // an "else", (meaning the the environment is not "development"), then the cookie is created with the same name 
        // and token, but with the added option of "secure: true". This means that the cookie can only be passed through 
        // HTTPS and not HTTP. This is a security measure to ensure that the cookie is not passed through an unsecured connection.
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      // the application then redirects to the default account route. This should deliver an account management view.
      return res.redirect("/account/");
    }
    // an error will occur if the passwords do not match and the token and cookie cannot be created.
    else {
      req.flash("message notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}

function logoutUser(req, res) {
  res.clearCookie('jwt');
  req.flash('notice', 'You have been logged out successfully.');
  res.redirect('/');
}

async function modifyAccountView(req, res, next) {
  const account_id = parseInt(req.params.account_id);
  const jwtId = res.locals.accountData.account_id;

  if (account_id !== jwtId) {
    req.flash("notice", "You are unauthorized to access this page.");
    return res.redirect("/account");
  }
  else {
    let nav = await utilities.getNav();
    const result = await accountModel.getUserByAccountId(account_id);
    const userData = result[0];
  
    res.render("account/update-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: userData.account_firstname,
      account_lastname: userData.account_lastname,
      account_email: userData.account_email,
      account_id: userData.account_id,
    });
  }
}

/* ****************************************
*  Update Account Data
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id
  } = req.body;
  const updateResult = await accountModel.updateAccountData(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (updateResult) {
    // This sets a new JWT cookie so that the username displayed in the header changes 
    // if the user updated the their username.
    const accessToken = jwt.sign(updateResult, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
    
    if (process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
    }
    req.flash("notice", `Your account information has been changed.`);
    res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, Updating your account information has failed.");
    res.status(501).render("account/update-account", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_id,
    });
  }
}

async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;
  // gets the account data to keep the update account form sticky
  const result = await accountModel.getUserByAccountId(account_id);
  const userData = result[0];

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updateAccountPassword(
      hashedPassword,
      account_id
    );

    if (updateResult) {
      req.flash("notice", `Your password has been changed.`);
      res.redirect("/account");
    } else { 
      req.flash("notice", "Sorry, Updating your password has failed.");
      res.status(501).render("account/update-account", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname: userData.account_firstname,
        account_lastname: userData.account_lastname,
        account_email: userData.account_email,
        account_id: userData.account_id
      });
    }
  } catch (error) {
      req.flash("notice", "An error occurred.");
      res.status(500).redirect("/account");
  }
}

/* ****************************************
*  Update Review Data
* *************************************** */
async function updateReview(req, res, next) {
  let nav = await utilities.getNav();
  const { review_text, review_id } = req.body;
  const updateResult = await accountModel.updateReviewData(review_text, review_id);

  if (updateResult) {
    req.flash("notice", `Your review was successfully updated.`);
    res.redirect("/account");

  } else {
    const review_id = parseInt(req.body.review_id);
    const result = await accountModel.getReviewByReviewId(review_id);
    const itemData = result[0];
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    req.flash("notice", "Sorry, the review failed to update.")
    res.status(501).render("account/edit-review", {
    title: "Edit Review For " + itemName,
    nav,
    errors,
    review_id: itemData.review_id,
    review_text: itemData.review_text
    });
  }
}

/* ***************************
 *  Build delete review data view
 * ************************** */
async function deleteReviewConfirmView(req, res, next) {
  const review_id = parseInt(req.params.rev_id);
  let nav = await utilities.getNav();
  const result = await accountModel.getReviewByReviewId(review_id);
  const itemData = result[0];
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("account/delete-review", {
    title: "Delete review for " + itemName,
    nav,
    errors: null,
    account_firstname: itemData.account_firstname,
    review_text: itemData.review_text,
    review_id: itemData.review_id
  });
}

/* ****************************************
*  delete review Data
* *************************************** */
async function deleteReview(req, res, next) {
  const review_id = parseInt(req.body.review_id);
  const deleteResult = await accountModel.deleteReviewData(review_id);

  if (deleteResult) {
    req.flash("notice", `Your review was deleted successfully.`);
    res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, the deletion failed.");
    res.status(501).redirect(`/account/delete/${review_id}`);
  }
}

//exports the function for use elsewhere.
module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement,
  logoutUser,
  modifyAccountView,
  updateAccount,
  updatePassword,
  getReviewsJSON,
  editReviewView,
  updateReview,
  deleteReview,
  deleteReviewConfirmView
}
