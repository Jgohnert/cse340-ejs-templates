const pool = require("../database/");

/* *****************************
*   Register new account
* *************************** */
// declares it to use "async", provides the function name, and lists the four parameters the function expects to receive.
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    // declares a "sql" variable and the SQL query to write the data to the database. Note: placeholders are 
    // used - $# - as part of the "parameterized statement" syntax. Additionally, 'Client' is included in the SQL 
    // statement to indicate the "type" of account being registered. The "RETURNING *" clause indicates to the 
    // PostgrSQL server to return values based on the record that was inserted.
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    // Note the use of "await" to wait until the promise has been replaced with data, from the query executing the 
    // SQL statement and replacing the placeholders with the actual data in the variables.
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = { registerAccount, checkExistingEmail }
