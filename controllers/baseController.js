// imports an index.js file from a utilities folder
const utilities = require("../utilities/");
// creates an empty object named baseController
const baseController = {}

// creates an anonymous, asynchronous function and assigns the function 
// to buildHome which acts as a method of the baseController object
// this is similar in concept to creating a method within a class, 
// where baseController would be the class name and buildHome would be the method.
baseController.buildHome = async function(req, res){
  // calls a getNav() function that will be found in the utilities > index.js file. 
  // The results, when returned, will be stored into the nav variable.
  const nav = await utilities.getNav();
  // is the Express command to use EJS to send the index view back to the client, 
  // using the response object. The index view will need the "title" name - value 
  // pair, and the nav variable. The nav variable will contain the string of HTML 
  // code to render this dynamically generated navigation bar.
  res.render("index", {title: "Home", nav});
}

// exports the baseController object for use elsewhere.
module.exports = baseController;