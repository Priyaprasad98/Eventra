const express = require('express');
const studentRouter = express.Router();
const studentController = require('../controllers/studentController');

studentRouter.get('/events', studentController.getEvents);

studentRouter.get('/register/:eventId', studentController.getRegistrationForm);

studentRouter.post('/register/:eventId', studentController.postRegistrationForm);

studentRouter.get('/feedback/:eventId', studentController.getFeedback);

studentRouter.post('/feedback/:eventId', studentController.postFeedback);



module.exports = studentRouter;