'use strict'

async function reviewList() {
  try {
    const response = await fetch("/account/reviews");
    if (!response.ok) throw new Error("Failed to load reviews");
    const data = await response.json();
    buildReviewHistoryList(data);
  } catch (err) {
    console.error("ReviewList error:", err);
  }
}

function buildReviewHistoryList(data) { 
  let reviewDisplay = document.getElementById("reviewDisplay"); 
  let dataTable = "<thead>"; 
  dataTable += "<tr><th>Review List</th><td>&nbsp;</td><td>&nbsp;</td></tr>"; 
  dataTable += "</thead>"; 
  dataTable += "<tbody>"; 
  data.forEach(function (element) {
    const date = new Date(element.review_date);
    const abbreviatedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
    dataTable += `<tr>
                <td>Reviewed the ${element.inv_year} ${element.inv_make} 
                ${element.inv_model} on ${abbreviatedDate}
                </td>
                <td><a href='/account/edit/${element.review_id}' title='Click to update'>Edit</a></td>
                <td><a href='/account/delete/${element.review_id}' title='Click to delete'>Delete</a></td></tr>`;
  }) 
  dataTable += '</tbody>';

  reviewDisplay.innerHTML = dataTable; 
}

reviewList();