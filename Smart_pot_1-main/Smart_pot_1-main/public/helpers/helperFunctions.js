// helpers.js
const admin = require("firebase-admin");

function calculateAverage(data) {
  try {
    let totalRecords = 0;
    let totalTempC = 0;
    let totalTempF = 0;
    let totalLight = 0;
    let totalHumidity = 0;
    let totalConnection = 0;
    let totalSoil = 0;

    data.forEach((item) => {
      const itemData = item.data;

      totalRecords++;

      // Summing up values
      totalTempC += itemData.Temp.C;
      totalTempF += itemData.Temp.F;
      totalLight += itemData.Light;
      totalHumidity += itemData.Humidity;
      totalConnection += itemData.Connection;
      totalSoil += itemData.Soil;
    });

    // Calculating averages
    const averageTempC = totalTempC / totalRecords;
    const averageTempF = totalTempF / totalRecords;
    const averageLight = +(totalLight / totalRecords).toFixed(4);
    const averageHumidity = totalHumidity / totalRecords;
    const averageConnection = totalConnection / totalRecords;
    const averageSoil = totalSoil / totalRecords;

    // Creating an object in the same format as the input, using the first item's id
    const result = {
      Temp: {
        C: averageTempC,
        F: averageTempF,
      },
      Light: averageLight,
      Humidity: averageHumidity,
      Connection: averageConnection,
      Soil: averageSoil
    };

    return result;
  } catch (error) {
    console.error('Error calculating average:', error);
    throw error;
  }
}


const resetCollection = async (collectionName) => {
  try {
    const firestore = admin.firestore();
    const collectionRef = firestore.collection(collectionName);

    const snapshot = await collectionRef.get();
    const batch = firestore.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Collection ${collectionName} reset successfully.`);
  } catch (error) {
    console.error(`Error resetting collection ${collectionName}:`, error);
    throw error;
  }
};

module.exports = { calculateAverage, resetCollection };
