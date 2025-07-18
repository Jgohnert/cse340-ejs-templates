// imports the database connection file (named index.js) from the database folder which is one level above the current file.
const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
// creates an "asynchronous" function, named getClassifications.
// It allows the application to continue and will then deal with the results from the promise when delivered.
async function getClassifications(){
    // will return (send back) the result of the SQL query, which will be sent to the database server using a pool connection, 
    // when the resultset (data) or an error, is sent back by the database server.
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
// declares an asynchronous function by name and passes a variable, which should contain the classification_id value, as a parameter.
async function getInventoryByClassificationId(classification_id) {
  try {
    // creates an SQL query to read the inventory and classification information from their respective tables using an INNER JOIN.
    // The "$1" is a placeholder, which will be replaced by the value shown in the brackets "[]" when the SQL statement is run.
    // The SQL is queried against the database via the database pool.
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    // sends the data, as an array of all the rows, back to where the function was called (in the controller).
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  a function to retrieve the data for a specific 
 *  vehicle in inventory, based on the inventory id
 * ************************** */
async function getVehicleByInvId(vehicle_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [vehicle_id]
    )
    return data.rows
  } catch (error) {
    console.error("getvehiclebyid error " + error);
  }
}

/* ***************************
 *  a function to retrieve the reviews in the review 
 *  table, based on the inventory id (vehicle_id)
 * ************************** */
async function getReviewsByInvId(vehicle_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_text, r.review_date, a.account_firstname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1 
      ORDER BY r.review_date DESC;`,
      [vehicle_id]
    );
    return data.rows
  } catch (error) {
    console.error("getReviewsByInvId error " + error);
    return []
  }
}

/* *****************************
*   Add new classification id
* *************************** */
async function addNewClassification(classification_id){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_id])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing classification name
 * ********************* */
async function checkExistingClassification(class_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [class_name]);
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

async function addNewVehicle(
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
){
  try {
    const sql = "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, 
      [classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventoryItem(
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
) {
  try {
    const sql =
      `UPDATE public.inventory SET 
      inv_make = $1, 
      inv_model = $2, 
      inv_description = $3, 
      inv_image = $4, 
      inv_thumbnail = $5, 
      inv_price = $6, 
      inv_year = $7, 
      inv_miles = $8, 
      inv_color = $9, 
      classification_id = $10 
      WHERE inv_id = $11 RETURNING *`;
    const data = await pool.query(sql, [
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
      inv_id
    ]);
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Delete Inventory item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data
  } catch (error) {
    console.error("model error: " + error);
  }
}

async function addNewReview( review_text, inv_id, account_id ){
  try {
    const sql = `INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *`;
    return await pool.query(sql, [review_text, inv_id, account_id]);
  } catch (error) {
    return error.message
  }
}

// exports the function for use elsewhere.
module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleByInvId,
  getReviewsByInvId,
  addNewClassification, 
  checkExistingClassification,
  addNewVehicle,
  updateInventoryItem,
  deleteInventoryItem,
  addNewReview
}