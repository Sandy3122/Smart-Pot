// script.js

$(document).ready(function () {
    // Function to fetch data from '/getDataFromRealtime' route
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch('/getDataFromRealtime');
        const data = await response.json();
        console.log('Fetched data from server (Realtime):', data);
  
        // Convert object to array if not already an array
        const dataArray = Array.isArray(data) ? data : [data];
  
        // Assuming data is an array of objects
        dataArray.forEach(function (item, index) {
          const sensorId = index + 1; // Assuming each sensor has a unique ID
          const temperature = item.Temp ? `${item.Temp.C}C/${item.Temp.F}F` : 'N/A';
          const humidity = item.Humidity !== undefined ? `${item.Humidity}%` : 'N/A';
          const soilMoisture = item.Soil !== undefined ? `${item.Soil}%` : 'N/A';
          const LightIntensity = item.Light !== undefined ? item.Light : 'N/A';
    
          // Update the UI with the fetched data
          $(`#temperature${sensorId}`).text(`Temperature: ${temperature}`);
          $(`#humidity${sensorId}`).text(`Humidity: ${humidity}`);
          $(`#soilMoisture${sensorId}`).text(`Soil Moisture: ${soilMoisture}`);
          $(`#uvIntensity${sensorId}`).text(`Light Intensity: ${LightIntensity}`);

          //Update plant message according to the conditions
          if(item.Temp.C>95){
            $(`#plantMessage`).text(`Daily message: Too Hot - Place the pot in coolder environment \nTemperature: ${temperature}`);
          }
          else if(item.Humidity<10){
            $(`#plantMessage`).text(`Daily message: Too Dry Humidity - Place the pot in humid environment \nHumidity: ${humidity}`);
          }
          else if(item.Humidity>95){
            $(`#plantMessage`).text(`Daily message: Too Humid Humidity - Place the pot in dry environment \nHumidity: ${humidity}`);
          }
          else{
            $(`#plantMessage`).text(`Daily message: Plant in Good Condition`);
          }

        });
      } catch (error) {
        console.error('Error fetching realtime data:', error);
      }
    };
  
    // Initial data fetch
    fetchRealtimeData();
    setInterval(fetchRealtimeData,1000);
  });
