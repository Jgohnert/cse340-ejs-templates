// requires the inventory-model file, so it can be used to get data from the database.
const invModel = require("../models/inventory-model")
// creates an empty Util object.
const Util = {}

const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
// creates an asynchronous function, which accepts the request, response and next 
// methods as parameters. The function is then stored in a getNav variable of the Util object.
Util.getNav = async function(req, res, next) {
  // calls the getClassifications() function from the inventory-model file and stores 
  // the returned resultset into the data variable.
  let data = await invModel.getClassifications();
  console.log(data);
  let list = "<ul>";
  // a new list item, containing a link to the index route, is added to the unordered list.
  list += '<li><a href="/" title="Home page">Home</a></li>'
  // uses a forEach loop to move through the rows of the data array one at a time.
  data.rows.forEach((row) => {
    list += "<li>";
    // the classification_id value found in the row from the array. It is being added into the link route.
    // the classification_name value found in the row from the array. It is being added into the title attribute.
    // the classification_name from the row being displayed between the opening and closing HTML anchor tags. 
    // This is the display name in the navigation bar.
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>";
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  // an "if" to see if the array is not empty.
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    // sets up a "forEach" loop, to break each element of the data array into a vehicle object.
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details" class="thumb-img"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


//takes the specific vehicle's information and wrap it up in HTML to deliver to the view,
Util.buildvehicleGrid = async function(data){
  let grid = "";
  if (data.length > 0) {
    const vehicle = data[0];
    grid = `
      <ul id="vehicle-display">
        <li class="vehicle-img">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
          </a>
        </li>
        <li class="imp-info"><b>Make:</b> ${vehicle.inv_make}</li>
        <li class="imp-info"><b>Model:</b> ${vehicle.inv_model}</li>
        <li class="imp-info"><b>Year:</b> ${vehicle.inv_year}</li>
        <li class="imp-info"><b>Price:</b> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</li>
        <li><b>Color:</b> ${vehicle.inv_color}</li>
        <li><b>Mileage:</b> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</li>
        <li><b>Description:</b> ${vehicle.inv_description}</li>
      </ul>`;
  } else {
    grid += '<p class="notice">Sorry, no matching vehicle could be found.</p>';
  }
  return grid;
}

const { format } = require("date-fns");

//takes all the reviews for a specific vehicle and wraps it up in HTML to deliver to the view,
Util.buildReviewLayout = async function(reviewData){
  let layout = "";

  if (reviewData.length > 0) {
    layout += `<ul id="review-display">`;
        
    for (const review of reviewData) {
      const abbreviatedDate = format(new Date(review.review_date), "MMM dd yyyy");
      layout += `
        <li class="user-review">
          <p class="user-name"><b>${review.account_firstname}</b></p>
          <p class="review-date">${abbreviatedDate}</p>
          <p>${review.review_text}</p>
          <hr>
        </li>`;
    }
        
    layout += `</ul>`;
  } else {
    layout += '<p>There are no reviews</p>';
  }
  return layout;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
* Middleware to check token validity
**************************************** */
// begins the function and assigns it to the "checkJWTToken" property of the Util object.
Util.checkJWTToken = (req, res, next) => {
//  an "if" check to see if the JWT cookie exists.
  if (req.cookies.jwt) {
  // if the cookie exists, uses the jsonwebtoken "verify" function to check the validity of the token.
  jwt.verify(
   // the JWT token from the cookie.
   req.cookies.jwt,
   //  the "secret" which is stored in the .env file.
   process.env.ACCESS_TOKEN_SECRET,
   //  the callback function (which returns an error or the account data from the token payload).
   function (err, accountData) {
    // an "if" to see if an error exists.
    if (err) {
     // if an error, meaning the token is not valid, a flash message is created.
     req.flash("Please log in")
     //  the cookie is deleted.
     res.clearCookie("jwt")
     //  redirects to the "login" route, so the client can "login".
     return res.redirect("/account/login")
    }
    // adds the accountData object to the response.locals object to be forwarded on through the rest of this request
    res.locals.accountData = accountData
    // adds "loggedin" flag with a value of "1" (meaning true) to the response.locals object to be forwarded on through the rest of this request
    res.locals.loggedin = 1

    res.locals.accountAdmin = accountData.account_type
    res.locals.accountEmployee = accountData.account_type
    // calls the "next()" function directing the Express server to move to the next step in the application's work flow.
    next()
   })
 } else {
  // calls the next() function, to move forward in the application process. In this case, there is no JWT cookie, so the process moves to the next step.
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
// creates the function and assigns it to the "Util" object with a name of "checkLogin".
Util.checkLogin = (req, res, next) => {
 // check to see if the login flag exists and is "true" in the response object.
 if (res.locals.loggedin) {
   // allows the process of the application to continue by using the "next()" function.
   next()
 } else {
   req.flash("notice", "Please log in.")
   // redirects to the login route, because the login flag does not exist.
   return res.redirect("/account/login")
 }
}

Util.checkAccountType = (req, res, next) => {
 if (res.locals.accountAdmin === 'Admin' || res.locals.accountAdmin === 'Employee') {
   next()
 } else {
   req.flash("notice", "Please login. You must be an admin or employee to access this page.")
   return res.redirect("/account/login")
 }
}

module.exports = Util