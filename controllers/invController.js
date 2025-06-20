// brings the inventory-model.js file into scope and stores its functionality into a invModel variable.
const invModel = require("../models/inventory-model");
// brings the utilities > index.js file into scope and stores its functionality into an utilities variable.
const utilities = require("../utilities/");

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
  const classification_id = req.params.classificationId;
  // calls the getInventoryByClassificationId function, which is in the inventory-model file and passes the classification_id as a parameter.
  const data = await invModel.getInventoryByClassificationId(classification_id);
  // calls a utility function to build a grid, containing all vehicles within that classification
  const grid = await utilities.buildClassificationGrid(data);
  // calls the function to build the navigation bar for use in the view and stores it in the nav variable.
  let nav = await utilities.getNav();
  // extracts the name of the classification, which matches the classification_id, from the data returned from the database
  const className = data[0].classification_name;
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

/* ***************************
 *  Build vehicle details view
 * ***************************/
invCont.buildByVehicleId = async function (req, res, next) {
  const vehicle_id = req.params.vehicleId;
  const data = await invModel.getVehicleByInvId(vehicle_id);
  const vehicleGrid = await utilities.buildvehicleGrid(data);
  let nav = await utilities.getNav();
  const vehicleName = `${data[0].inv_make} ${data[0].inv_model}`;
  res.render("./inventory/vehicle-details", {
    title: vehicleName,
    nav,
    vehicleGrid,
  });
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await invCont.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
    errors: null
  })
}

invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Vehicle Classification",
    nav,
    errors: null,
  })
}

// Builds the drop down list for the vehicle classifications on the add inventory form view.
invCont.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await invCont.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory Data",
    nav,
    classificationList,
    errors: null,
  })
}

/* ****************************************
*  Process classification id
* *************************************** */
invCont.newClassificationId = async function(req, res) {
  // retrieves and stores the navigation bar string for use in the view.
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const invResult = await invModel.addNewClassification(classification_name)

  // opens an "if" structure to determine if a result was received.
  if (invResult) {
    // sets a flash message to be displayed.
    req.flash(
      "notice",
      `${classification_name} has been saved and added to the database.`
    )

    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, adding the new classification id failed.")

    res.status(501).render("inventory/add-classification", {
      title: "Add New Vehicle Classification",
      nav,
    })
  }
}

/* ****************************************
*  Process new vehicle information
* *************************************** */
invCont.newVehicleInfo = async function(req, res) {
  let nav = await utilities.getNav()
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color } = req.body

  const invResult = await invModel.addNewVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  if (invResult) {
    req.flash(
      "notice",
      `${inv_make} ${inv_model} has been saved.`
    )

    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, adding the new vehicle failed.")

    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle Classification",
      nav,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  // collects and stores the classification_id that has been passed as a parameter 
  // through the URL. Uses the JavaScript parseInt() function to cast it as an integer, which is also a security step.
  const classification_id = parseInt(req.params.classification_id)
  // calls the model-based function to get the data based on the classification_id.
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  // checks to make sure there is a value in the first element of the array being returned.
  if (invData[0].inv_id) {
    // if data is present, returns the result set as a JSON object.
    return res.json(invData)
  } else {
    // throws an error for the Express error handler if no data is found.
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build modify inventory view
 * ************************** */
invCont.modifyInventoryView = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const result = await invModel.getVehicleByInvId(inventory_id)
  const itemData = result[0]
  let classificationList = await invCont.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/modify-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ****************************************
*  Update Inventory Data
* *************************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventoryItem(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await invCont.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/modify-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory item view
 * ************************** */
invCont.deleteConfirmView = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  const result = await invModel.getVehicleByInvId(inventory_id)
  const itemData = result[0]
  let classificationList = await invCont.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ****************************************
*  delete Inventory Data
* *************************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", `The deletion was successful.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).redirect("inv/delete/inv_id", {
    })
  }
}

module.exports = invCont