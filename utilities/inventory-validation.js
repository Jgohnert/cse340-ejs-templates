const inventoryModel = require("../models/inventory-model");

const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Add new classification rules
  * ********************************* */
validate.classificationRules = () => {
    return [
      body("classification_name")
        .trim()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a classification name.")
        .matches(/^[A-Za-z]+$/)
        .withMessage("Classification name must be alphabetic characters only. No spaces, special characters or numbers.")
        .custom(async (classification_name) => {
            const classExists = await inventoryModel.checkExistingClassification(classification_name)
            if (classExists){
            throw new Error("Classification name exists. Please enter a different name.")
          }
        })
    ]
}

validate.inventoryRules = () => {
    return [
      body("inv_make")
        .trim()
        .notEmpty()
        .withMessage("Add the make.")
        .isLength({ min: 3 })
        .withMessage("The make must be a minimum of 3 characters."),

      body("inv_model")
        .trim()
        .notEmpty()
        .withMessage("Add the model.")
        .isLength({ min: 3 })
        .withMessage("The model must be a minimum of 3 characters."),
      
      body("inv_description")
        .trim()
        .notEmpty()
        .withMessage("Write a description."),

      body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Add an image path."),

      body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Add an thumbnail image path."),
      
      body("inv_price")
        .trim()
        .notEmpty()
        .withMessage("Add the price of the vehicle.")
        .isNumeric()
        .withMessage("Only use numbers for the price of the vehicle."),

      body("inv_year")
        .trim()
        .notEmpty()
        .withMessage("Add the year.")
        .matches(/^\d{4}$/)
        .withMessage("Year must be 4 digits.")
        .isNumeric()
        .withMessage("Only use numbers for the year of the vehicle."),

      body("inv_miles")
        .trim()
        .notEmpty()
        .withMessage("Add the miles.")
        .isNumeric()
        .withMessage("Only use numbers for the miles of the vehicle."),

      body("inv_color")
        .trim()
        .notEmpty()
        .withMessage("Add the color of the vehicle.")
    ]
}

/* ******************************
 * Check data and return errors or continue to add-classification view
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  
  const { classification_name } = req.body
  let errors = []
  
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Vehicle Classification",
      nav,
      classification_name
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to add-vehicle view
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
  
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
  let errors = []
  
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await require("../controllers/invController").buildClassificationList(req.body.classification_id);
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory Data",
      nav,
      classificationList,
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
    })
    return
  }
  next()
}

/* ******************************
 * errors will be directed back to the edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
      inv_id, 
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
  let errors = []
  
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const inventory_id = parseInt(inv_id)
    let nav = await utilities.getNav()
    const result = await inventoryModel.getVehicleByInvId(inventory_id)
    const itemData = result[0]
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    const classificationList = await require("../controllers/invController").buildClassificationList(req.body.classification_id);
    res.render("inventory/modify-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      inv_id,
      classificationList,
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
    })
    return
  }
  next()
}

module.exports = validate
