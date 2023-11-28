// import MainModel from "../models/mainModel.js";
$(document).ready(function () {
  // Initialize serial number counter

  let snoCounter = 0;
  // Function to fetch data from '/getData' route
  const fetchData = async () => {
    try {
      const response = await fetch("/getDataFromFireStore");
      const data = await response.json();
      console.log("Fetched data from server:", data);

      // Sorting the data based on timestamp
      data.sort((a, b) => b.timestamp._seconds - a.timestamp._seconds);

      // Count the total number of data items
      const totalDataItems = data.length;

      // Set snoCounter to the total number of data items
      snoCounter = totalDataItems + 1;

      // Clearing the existing table rows
      $("#sensorDataTable tbody").empty();

      // Extracting the timestamp of the last data update
      const lastUpdate = new Date().toLocaleTimeString();

      // Updating the UI with the last updated time
      $("#lastUpdateTime").text(`Last Updated: ${lastUpdate}`);

      // Assuming data is an array of objects
      data.forEach(function (item) {
        // Increment serial number counter
        snoCounter--;

        // Extracting properties from the data item
        const temperatureC = item.data.Temp ? item.data.Temp.C || "" : "";
        const temperatureF = item.data.Temp ? item.data.Temp.F || "" : "";
        const humidity =
          item.data.Humidity !== undefined ? item.data.Humidity : "";
        const soilMoisture = item.data.Soil !== undefined ? item.data.Soil : "";
        const lightIntensity =
          item.data.Light !== undefined ? item.data.Light : "";
        const timestampSeconds = item.timestamp ? item.timestamp._seconds : 0;
        const timestamp = new Date(timestampSeconds * 1000).toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        );

        // Append rows to the table
        $("#sensorDataTable tbody").append(
          `<tr>
        <td class="text-center">${snoCounter}</td>
			  <td class="text-center">${timestamp}</td>
			  <td class="text-center">${temperatureC}C/${temperatureF}F</td>
			  <td class="text-center">${humidity}</td>
			  <td class="text-center">${soilMoisture}</td>
			  <td class="text-center">${lightIntensity}</td>
			</tr>`
        );
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
  // Set up a timer to fetch data every 30 minute
  setInterval(fetchData, 30 * 60 * 1000);
});
