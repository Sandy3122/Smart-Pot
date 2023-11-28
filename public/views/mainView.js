// mainView.js
const MainView = {
    sendJsonResponse: (res, data) => {
      res.json(data);
    },
  
    sendError: (res, status, message) => {
      res.status(status).send(message);
    },
  };
  
  module.exports = MainView;
  