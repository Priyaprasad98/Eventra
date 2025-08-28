const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
 
adminRouter.use((req,res,next) => {
  if(req.session.user.userType == 'Admin') {
    next();
  }
  else {
    res.render("error/403", {
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
      pageTitle: "Error 403",
      currentPage: ""
    })
  }
});
adminRouter.get('/add-event', adminController.getAddEvent);

adminRouter.post('/add-event', adminController.postAddEvent);

adminRouter.get("/edit-event/:id", adminController.getEditEvent);

adminRouter.post("/edit-event/:id", adminController.postEditEvent);

adminRouter.get("/event-list", adminController.getAdminEventList);

adminRouter.post("/delete-event/:id", adminController.postDeleteEvent);

adminRouter.get("/events", adminController.getAdminEventCards);

module.exports = adminRouter;