// The express package is brought into the scope of the file and assigned to a local variable.
const express = require('express');
// The Express "router" functionality is invoked and stored into a local variable for use.
const router = express.Router();

// Static Routes
// Set up "public" folder / subfolders for static files

// Indicates that the Express router is to "use" the "express.static" function, meaning this is where static resources will be found, with the public folder.
router.use(express.static("public"));
// Indicates that any route that contains /css is to refer to the public/css folder, which is found at the root level of the project.
router.use("/css", express.static(__dirname + "public/css"));
// Indicates that any route that contains /js is to refer to the public/js folder, which is found at the root level of the project.
router.use("/js", express.static(__dirname + "public/js"));
// Indicates that any route that contains /images is to refer to the public/images folder, which is found at the root level of the project.
router.use("/images", express.static(__dirname + "public/images"));

// exports the router object, along with all of these use statements for use in other areas of the application. This is VERY IMPORTANT. If a resource is NOT exported, it cannot be used somewhere else.
module.exports = router;



