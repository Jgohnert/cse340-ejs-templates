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
// "/" - This is route being watched. It indicates the base route of the application or the route which has no specific resource requested.
// res.render() - The "res" is the response object, while "render()" is an Express function that will retrieve the specified view - "index" - to be sent back to the browser.
// {title: "Home" } - The curly braces are an object (treated like a variable), which holds a name - value pair. This object supplies the value that the "head" partial file expects to receive. The object is passed to the view.
app.get("/", function(req, res) {
  res.render("index", {title: "home"})
});

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
  console.log(`app listening on ${host}:${port}`)
});
