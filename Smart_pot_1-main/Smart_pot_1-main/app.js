const express = require("express");
const MainController = require("./public/controllers/mainController");
const app = express();
const path = require('path');
const cors = require('cors');
const { Module } = require("module");

// Static file serving middleware
app.use(express.static(path.join(__dirname, 'public')));


// Enable CORS for all routes
app.use(cors());

// Routes
// Main Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/pages/index.html"));
});

//DataLog Page
app.get('/DataLog', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/pages/DataLog.html"));
});

// AboutUs Page
app.get('/aboutUs', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/pages/aboutUs.html'));
});

// Retrieving Data From FireStore Database
app.get("/getDataFromFireStore", MainController.fetchData);

// Retrieving Data From RealTime Database
app.get("/getDataFromRealtime", MainController.fetchRealtimeData);

// Retrieving Average Data From FireStore Database
app.get("/getAverageData", MainController.getAvgData);

// Retrieving Average Data From FireStore Database
app.get("/getWeeklyAverageData", MainController.getWeeklyAvgData);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


