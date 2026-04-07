// imports the "Pool" functionality from the "pg" package.
// allows multiple site visitors to be interacting with the database at any given time.
const { Pool } = require("pg")

// allows the sensitive information about the database location and connection 
// credentials to be stored in a separate location and still be accessed.
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
// creates a local pool variable to hold the functionality of the "Pool" connection.
let pool

// test to see if the code exists in a developent environment, as declared in the 
// .env file. In the production environment, no value will be found.
if (process.env.NODE_ENV == "development") {
    // creates a new pool instance from the imported Pool class.
    pool = new Pool({
    // indicates how the pool will connect to the database (use a connection string) 
    // and the value of the string is stored in a name - value pair, which is in the 
    // .env file locally, and in an "environment variable" on a remote server.
    connectionString: process.env.DATABASE_URL,
    // describes how the Secure Socket Layer (ssl) is used in the connection to the database
    ssl:  false
  })

// Added for troubleshooting queries
// during development
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
}
} else {
  pool = new Pool({
    // indicates the value of the connection string will 
    // be found in an environment variable. In the production 
    // environment, such a variable will not be stored in our .env file
    connectionString: process.env.DATABASE_URL,
  })
    // exports the pool object to be used whenever a database connection is needed.
  module.exports = pool
}