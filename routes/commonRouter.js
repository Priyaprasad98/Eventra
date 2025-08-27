const express = require('express');
const commonRouter = express.Router();
const commonController = require('../controllers/commonController');

commonRouter.get('/', commonController.getIndex);

commonRouter.get('/events/:eventId', commonController.getEventDetail);

commonRouter.get('/details/:eventId', commonController.downloadDetail);

module.exports = commonRouter;