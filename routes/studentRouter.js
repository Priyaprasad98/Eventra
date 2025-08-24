const express = require('express');
const studentRouter = express.Router();
const studentController = require('../controllers/studentController');

// Add your routes here

 studentRouter.get('/events', studentController.getEvents);

 studentRouter.get('/register/:eventId', studentController.getRegistrationForm);

studentRouter.post('/register/:eventId', studentController.postRegistrationForm);

//studentRouter.post('/feedback/:eventId', studentController.getfeedback);

module.exports = studentRouter;