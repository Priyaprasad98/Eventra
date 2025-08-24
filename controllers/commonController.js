const Event = require("../models/events");

exports.getIndex = (req, res, next) => {

  res.render("commonPages/landing", {
    pageTitle: "Home",
    currentPage: "Home"
  });
};
