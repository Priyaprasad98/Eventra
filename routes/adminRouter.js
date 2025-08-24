const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
console.log("Loaded adminController keys:", Object.keys(adminController));
// Add your routes here
// Example:
adminRouter.get('/add-event', adminController.getAddEvent);

adminRouter.post('/add-event', adminController.postAddEvent);

adminRouter.get("/edit-event/:id", adminController.getEditEvent);

adminRouter.post("/edit-event/:id", adminController.postEditEvent);

adminRouter.get("/event-list", adminController.getAdminEventList);

adminRouter.post("/delete-event/:id", adminController.postDeleteEvent);

adminRouter.get("/events", adminController.getAdminEventCards);

module.exports = adminRouter;