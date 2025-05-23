// brings Express into the scope of the file.
const express = require("express");
// uses Express to create a new Router object.
// using separate router files for specific elements of the application would keep the server.js file smaller and more manageable
const router = new express.Router();
// brings the inventory controller into this router document's scope to be used.
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

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