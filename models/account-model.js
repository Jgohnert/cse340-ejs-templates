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

// /* *****************************
// * Return account data using email address
// * ***************************** */
async function getAccountByEmail (account_email) {
  try {
    // creates a variable to store the results of the query.
    const result = await pool.query(
      // a SQL SELECT query using the parameterized statement syntax. This is the first argument in the pool.query function.
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      // passes in the client_email, as an array element to replace the placeholder at the end of the SQL statement. This is the second argument in the pool.query function.
      [account_email])
    // sends the first record, from the result set returned by the query, back to where this function was called.
    return result.rows[0]
  } catch (error) {
    // sends the error, if any, to the console for review.
    return new Error("No matching email found")
  }
}

async function getUserByAccountId(account_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.account
      WHERE account_id = $1`,
      [account_id]
    )
    return data.rows
  } catch (error) {
    console.error("getUserByAccountId error " + error);
  }
}

/* ***************************
 *  Update account Data
 * ************************** */
async function updateAccountData(
  account_firstname,
  account_lastname,
  account_email,
  account_id
) {
  try {
    const sql =
      `UPDATE public.account SET 
      account_firstname = $1, 
      account_lastname = $2, 
      account_email = $3 
      WHERE account_id = $4 RETURNING *`
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

async function updateAccountPassword(
  account_password,
  account_id
) {
  try {
    const sql =
      `UPDATE public.account SET 
      account_password = $1
      WHERE account_id = $2 RETURNING *`
    const data = await pool.query(sql, [
      account_password,
      account_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getAccountByEmail,
  getUserByAccountId,
  updateAccountData,
  updateAccountPassword
}
