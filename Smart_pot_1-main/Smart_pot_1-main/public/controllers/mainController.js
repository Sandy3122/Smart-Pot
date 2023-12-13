// mainController.js
const MainModel = require("../models/mainModel");
const MainView = require("../views/mainView");

const MainController = {
  fetchData: async (req, res) => {
    try {
      const data = await MainModel.getDataFromFirestore();
      MainView.sendJsonResponse(res, data);
    } catch (error) {
      MainView.sendError(res, 500, "Internal Server Error");
    }
  },

  fetchRealtimeData: async (req, res) => {
    try {
      const data = await MainModel.getDataFromRealtime();
      MainView.sendJsonResponse(res, data);
    } catch (error) {
      MainView.sendError(res, 500, "Internal Server Error");
    }
  },

  getAvgData: async (req, res) => {
    try {
      const avgData = await MainModel.getAverageData();
      MainView.sendJsonResponse(res, avgData);
    } catch (error) {
      MainView.sendError(res, 500, "Internal Server Error");
    }
  },

  getWeeklyAvgData: async (req, res) => {
    try {
      const WeeklyAvgData = await MainModel.getWeeklyAverageData();
      MainView.sendJsonResponse(res, WeeklyAvgData);
    } catch (error) {
      MainView.sendError(res, 500, "Internal Server Error");
    }
  },
};

module.exports = MainController;
