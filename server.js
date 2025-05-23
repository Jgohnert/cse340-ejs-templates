/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
// we tell the application to require express-ejs-layouts, so it can be used.
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/"); // is the index.js file in the utilities folder

/* ***********************
 * View Engine and Templates
 *************************/
// we declare that ejs will be the view engine for our application. 
// Built into EJS is the understanding that all views will be stored in a views 
// folder, and that is where EJS will look for all view files.
app.set("view engine", "ejs");
// tells the application to use the express-ejs-layouts package
app.use(expressLayouts);
// when the express ejs layout goes looking for the basic template for a view, 
// it will find it in a layouts folder, and the template will be named layout.
// EJS will read the path ./layouts/layout and look in the views folder 
// (indicated by the period), then for a subfolder named layouts, then for a file named layout.ejs.
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
// app.get - The express application will watch the "get" object, within the HTTP Request, for a particular route.
// "/" - This is route being watched. It indicates the base route of the application or the route which has no 
// specific resource requested.
// utilities.handleErrors(baseController.buildHome) - the middleware function that catches any errors generated
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
// composed of three elements:
// 1. app.use() is an Express function that directs the application to use the resources passed in as parameters.
// 2. /inv is a keyword in our application, indicating that a route that contains this word will use this 
// route file to work with inventory-related processes.
// 3. inventoryRoute is the variable representing the inventoryRoute.js file which was required
// any route that starts with /inv will then be redirected to the inventoryRoute.js file, to find the rest 
// of the route in order to fulfill the request.
app.use("/inv", inventoryRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'});
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
// app.use is an Express function, which accepts the default Express arrow function to be used with errors.
app.use(async (err, req, res, next) => {
  // builds the navigation bar for the error view.
  let nav = await utilities.getNav();
  // a console statement to show the route and error that occurred. This is helpful to you to know what 
  // the client was doing when the error occurred.
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  //  this line checks to see if the status code is 404. If so, the default error message - "File Not Found" - is assigned to the "message" property. If it is anything else, a generic message is used.
  if(err.status == 404){ message = err.message}
  else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  // calls the "error.ejs" view
  res.render("errors/error", {
    // sets the value of the "title" for the view. It will use the status code or "Server Error" as the 
    // title if no status code is set.
    title: err.status || 'Server Error',
    message,
    // sets the navigation bar for use in the error view.
    nav
  });
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});