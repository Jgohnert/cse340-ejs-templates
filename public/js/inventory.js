// the 'use strict' directive tells the JavaScript parser to follow all 
// rules strictly.
'use strict' 
 
// Get a list of items in inventory based on the classification_id 
// Finds the classification select element in the inventory management 
// view, based on its ID, and stores its reference into a local 
// JavaScript variable.
let classificationList = document.querySelector("#classificationList");
// Attaches the eventListener to the variable representing the 
// classification select element and listens for any "change". When a 
// change occurs an anonymous function is executed.
classificationList.addEventListener("change", function () { 
  //  Captures the new value from the classification select element and 
  // stores it into a JavaScript variable.
  let classification_id = classificationList.value;
  // Writes the value as part of a string to the console log for testing purposes.
  console.log(`classification_id is: ${classification_id}`);
  // The URL that will be used to request inventory data from the inventory controller.
  let classIdURL = "/inv/getInventory/"+classification_id;
  // The JavaScript "Fetch" which is a modern method of initiating an AJAX request.
  fetch(classIdURL)
  // A "then" method that waits for data to be returned from the fetch. The 
  // response object is passed into an anonymous function for processing.
  .then(function (response) { 
    // An "if" test to see if the response was retuned successfully. If not, the error occurs.
    if (response.ok) { 
      // If the response was successful, then the JSON object that was 
      // returned is converted to a JavaScript object and passed on to the next "then" statement.
      return response.json(); 
   } 
  // The error that occurs if the "if" test fails. 
   throw Error("Network response was not OK");
  })
  //   Accepts the JavaScript object from line 12, and passes it as a parameter into an anonymous function.
  .then(function (data) { 
    // Sends the JavaScript object to the console log for testing purposes.
    console.log(data); 
    // Sends the JavaScript object to a new function that will parse 
    // the data into HTML table elements and inject them into the inventory management view.
    buildInventoryList(data); 
  }) 
  // A "catch" which captures any errors and sends them into an anonymous function.
  .catch(function (error) { 
    // Writes the caught error to the console log for us to see for troubleshooting.
    console.log('There was a problem: ', error.message);
  }) 
})

// Build inventory items into HTML table components and inject into DOM 
// Declares the function and indicates the JavaScript object is a required parameter.
function buildInventoryList(data) { 
  // Reaches into the HTML document, uses the ID to capture the element 
  // and assigns it to a JavaScript variable for use later.
  let inventoryDisplay = document.getElementById("inventoryDisplay"); 
  // Set up the table labels 
  let dataTable = '<thead>'; 
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
  dataTable += '</thead>'; 
  // Set up the table body 
  dataTable += '<tbody>'; 
  // Iterate over all vehicles in the array and put each in a row 
  // Implements the foreach method on the data object. Each element in 
  // the object is sent into an anonymous function as a parameter.
  data.forEach(function (element) { 
   // Sends the name and id of each element to the console log for testing purposes. 
   console.log(element.inv_id + ", " + element.inv_model); 
   dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
   dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
   dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
  }) 
  dataTable += '</tbody>'; 
  // Display the contents in the Inventory Management view 
  inventoryDisplay.innerHTML = dataTable; 
}