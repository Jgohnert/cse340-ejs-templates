// requires the inventory-model file, so it can be used to get data from the database.
const invModel = require("../models/inventory-model")
// creates an empty Util object.
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
// creates an asynchronous function, which accepts the request, response and next 
// methods as parameters. The function is then stored in a getNav variable of the Util object.
Util.getNav = async function(req, res, next) {
  // calls the getClassifications() function from the inventory-model file and stores 
  // the returned resultset into the data variable.
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  // a new list item, containing a link to the index route, is added to the unordered list.
  list += '<li><a href="/" title="Home page">Home</a></li>'
  // uses a forEach loop to move through the rows of the data array one at a time.
  data.rows.forEach((row) => {
    list += "<li>"
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
    list += "</li>"
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
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
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

module.exports = Util