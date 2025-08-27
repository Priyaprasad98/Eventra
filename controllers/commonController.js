const mongoose = require("mongoose");
const path = require("path");


const Event = require("../models/events");
const Feedback = require("../models/feedback");
const formatEventDate = require("../utils/format");
const rootDir = require("../utils/pathUtils");

exports.getIndex = (req, res, next) => {
  res.render("commonPages/landing", {
    pageTitle: "Home",
    currentPage: "Home",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
  });
};
exports.getEventDetail = async (req, res, next) => {
  const eventId = req.params.eventId;
  const event = await Event.findById(eventId);
  const feedbacks = await Feedback.find({
    eventId: new mongoose.Types.ObjectId(eventId)
  });

  res.render("commonPages/event-detail", {
    pageTitle: event.name,
    currentPage: "Events",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    event,
    eventTime: formatEventDate(event.startDate),
    feedbacks: feedbacks || {}
  });
};

exports.downloadDetail = async (req,res,next) => {
  if(!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  else {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    const fileName = `Event Details-${event.name}.pdf`;
    const filePath = path.join(rootDir, "uploads", "docs", event.docs[0]);
    res.download(filePath, fileName, err => {
      if(err) {
        console.log("Download error:, err");
        return res.status(404).render("error/404", {
          pageTitle: "Page Not Found",
          currentPage: "",
          isLoggedIn: req.isLoggedIn,
          user: req.session.user
        });
      }
    }
  )};
};
