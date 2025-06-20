// brings Express into the scope of the file.
const express = require("express");
// uses Express to create a new Router object.
// using separate router files for specific elements of the application would keep the server.js file smaller and more manageable
const router = new express.Router();
// brings the inventory controller into this router document's scope to be used.
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require('../utilities/inventory-validation');

// route that builds the inventory management view on the management.ejs file.
router.get("/", utilities.handleErrors(invController.buildManagementView));

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView));

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to the modify inventory info page
router.get("/edit/:inventory_id", utilities.handleErrors(invController.modifyInventoryView));

// Route to delete an inventory item
router.get("/delete/:inventory_id", utilities.handleErrors(invController.deleteConfirmView));

// Route to the update inventory success page
router.post(
  "/modify-inventory", 
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// "post" route handler that will call a controller function to carry out the delete process.
router.post(
  "/delete", 
  utilities.handleErrors(invController.deleteItem)
);

// Process the new classification id data
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.newClassificationId)
)

// Process the new classification id data
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.newVehicleInfo)
)

// Route to build inventory by classification view
// the route, which is divided into three elements:
// 1. "get" indicates that the route will listen for the GET method within the request (typically a clicked link or the URL itself).
// 2. /type/:classificationId the route being watched for
// 3. invController.buildByClassification indicates the buildByClassification function within the invController will be used to 
// fulfill the request sent by the route.
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle details by classification view
router.get("/detail/:vehicleId", utilities.handleErrors(invController.buildByVehicleId));



module.exports = router;