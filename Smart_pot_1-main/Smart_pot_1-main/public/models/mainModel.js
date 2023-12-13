const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");
const cron = require("node-cron");
const {
  calculateAverage,
  resetCollection,
} = require("../helpers/helperFunctions.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://smart-pot-test-2-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const database = admin.database();
const firestore = admin.firestore();

let cachedData = [];

const MainModel = {
  updateFirestore: async () => {
    try {
      const realtimeData = await database.ref("Sensor").once("value");
      const dataToStore = realtimeData.val();

      await firestore.collection("updatedData").add({
        data: dataToStore,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Data updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
    }
  },

  resetFirestore: async () => {
    try {
      const snapshot = await firestore.collection("updatedData").get();
      const updatedData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      // Get the last updated data into cachedData
      cachedData = updatedData;

      // Calculate average values
      const avgValues = calculateAverage(updatedData);

      // Store average values in the averageData collection
      await firestore.collection("averageData").add({
        averages: avgValues,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(cachedData);
      // cachedData = []

      // Reset the updatedData collection
      await resetCollection("updatedData");

      console.log("Firestore reset and average values stored successfully!");
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  },

  // Resetting firestore weekly and getting the average data over a week
  resetFirestoreWeekly: async () => {
    try {
      const snapshot = await firestore.collection("averageData").get();
      const updatedData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      // Get the last updated data into cachedData
      cachedData = updatedData;

      // Calculate average values
      const avgValues = calculateAverage(updatedData);

      // Store average values in the averageData collection
      await firestore.collection("weeklyAverage").add({
        averages: avgValues,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(cachedData);
      // cachedData = []

      // Reset the updatedData collection
      await resetCollection("averageData");

      console.log("Weekly Firestore reset and average values stored successfully!");
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  },
  // Updates for every 30 mins
  scheduleUpdate: () => {
    cron.schedule("*/30 * * * *", async () => {
      await MainModel.updateFirestore();
    });
  },

  // Reset for every day midnight
  scheduleReset: () => {
    cron.schedule("0 0 * * *", async () => {
      // After updating, perform the reset
      await MainModel.resetFirestore();
    });
  },

  //Reset for every sunday midnight
  scheduleResetWeekly: () => {
    cron.schedule("0 0 * * 7", async () => {
      // After updating, perform the reset
      await MainModel.resetFirestoreWeekly();
    });
  },

  getDataFromFirestore: async () => {
    try {
      const snapshot = await firestore.collection("updatedData").get();
      const updatedData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      // Compare with cached data to get only the new items
      const newItems = updatedData.filter(
        (item) => !cachedData.some((cachedItem) => cachedItem.id === item.id)
      );

      // Combine new items with cached data
      const combinedData = [...cachedData, ...newItems];

      // Update the cache with the combined data
      cachedData = combinedData;

      return combinedData;
    } catch (error) {
      console.error("Error retrieving data:", error);
      throw error;
    }
  },

  getDataFromRealtime: async () => {
    try {
      const realtimeData = await database.ref("Sensor").once("value");
      const data = realtimeData.val();

      return data;
    } catch (error) {
      console.error("Error retrieving data from Realtime Database:", error);
      throw error;
    }
  },

  getAverageData: async () => {
    try {
      const snapshot = await firestore.collection("averageData").get();
      const averageData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      return averageData;
    } catch (error) {
      console.error("Error retrieving average data:", error);
      throw error;
    }
  },

  getWeeklyAverageData: async () => {
    try {
      const snapshot = await firestore.collection("weeklyAverage").get();
      const WeeklyAverageData = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      return WeeklyAverageData;
    } catch (error) {
      console.error("Error retrieving average data:", error);
      throw error;
    }
  },
};

// Scheduling the update task when the application starts
MainModel.scheduleUpdate();

// Schedule the reset task when the application starts
MainModel.scheduleReset();

// Schedule the reset task when the application starts
MainModel.scheduleResetWeekly();

module.exports = MainModel;
