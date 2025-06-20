/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const pool = require('./database/');

const express = require("express");
// we tell the application to require express-ejs-layouts, so it can be used.
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/"); // is the index.js file in the utilities folder
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
// invokes the app.use() function and indicates the session is to be applied.
// app.use() applies whatever is being invoked throughout the entire application.
 app.use(session({
  // store is referring to where the session data will be stored. 
  // creating a new session table in our PostgreSQL database using the "connect-pg-simple" package,
  store: new (require('connect-pg-simple')(session))({
    // tells the session to create a "session" table in the database if it does not already exist.
    createTableIfMissing: true,
    // uses our database connection pool to interact with the database server.
    pool,
  }),
  // indicates a "secret" name - value pair that will be used to protect the session.
  secret: process.env.SESSION_SECRET,
  // This session for the session in the database is typically "false". But, because we are 
  // using "flash" messages we need to resave the session table after each message, so it must be set to "true".
  resave: true,
  // important to the creation process when the session is first created.
  saveUninitialized: true,
  // this is the "name" we are assigning to the unique "id" that will be created for each session.
  // In order to maintain "state", the session id will be stored into a cookie and passed back and forth from the server to the browser.
  name: 'sessionId',
}))

// Express Messages Middleware
// requires the connect-flash package, within an app.use function, making it accessible throughout the application.
app.use(require('connect-flash')())
// app.use is applied and a function is passed in as a parameter. The funtion accepts the request, response and next objects as parameters.
app.use(function(req, res, next){
  // The express-messages package is required as a function. The function accepts the request and response objects as parameters. 
  // The functionality of the this function is assigned to the response object, using the "locals" option and a name of "messages". 
  // This allows any message to be stored into the response, making it available in a view.
  res.locals.messages = require('express-messages')(req, res)
  // calls the "next()" function, passing control to the next piece of middleware in the application. Ultimately, this allows messages 
  // to be set, then pass on to the next process.
  next()
})

// tells the express application to use the body parser to work with JSON data
app.use(bodyParser.json())
// tells the express application to read and work with data sent via a URL as well as from a form, stored in the request object's 
// body. The "extended: true" object is a configuration that allows rich objects and arrays to be parsed.
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(cookieParser())
app.use(utilities.checkJWTToken)

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

// Account routes
app.use("/account", accountRoute);

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