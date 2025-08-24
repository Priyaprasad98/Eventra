const express = require('express');
const commonRouter = express.Router();
const commonController = require('../controllers/commonController');

commonRouter.get('/', commonController.getIndex);



module.exports = commonRouter;