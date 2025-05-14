// brings the inventory-model.js file into scope and stores its functionality into a invModel variable.
const invModel = require("../models/inventory-model")
// brings the utilities > index.js file into scope and stores its functionality into an utilities variable.
const utilities = require("../utilities/")

// creates an empty object
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
// creates an asynchronous, anonymous function which accepts the request and response objects, 
// along with the Express next function as parameters. The function is stored into a named method of buildByClassificationId.
invCont.buildByClassificationId = async function (req, res, next) {
  // collects the classification_id that has been sent, as a named parameter, through the URL and stores it into the classification_id variable.
  // req is the request object, which the client sends to the server. params is an Express function, used to represent data that is passed 
  // in the URL from the client to the server. classificationId is the name that was given to the classification_id value in the inventoryRoute.js file
  const classification_id = req.params.classificationId
  // calls the getInventoryByClassificationId function, which is in the inventory-model file and passes the classification_id as a parameter.
  const data = await invModel.getInventoryByClassificationId(classification_id)
  // calls a utility function to build a grid, containing all vehicles within that classification
  const grid = await utilities.buildClassificationGrid(data)
  // calls the function to build the navigation bar for use in the view and stores it in the nav variable.
  let nav = await utilities.getNav()
  // extracts the name of the classification, which matches the classification_id, from the data returned from the database
  const className = data[0].classification_name
  // calls the Express render function to return a view to the browser. The view to be returned is named classification
  res.render("./inventory/classification", {
    // build the "title" value to be used in the head partial, but you'll notice that it is dynamic to match the data.
    title: className + " vehicles",
    // contains the nav variable, which will display the navigation bar of the view.
    nav,
    // contains the HTML string, containing the - grid - of inventory items.
    grid,
  })
}

module.exports = invCont