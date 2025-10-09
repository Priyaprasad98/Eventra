const mongoose = require("mongoose");
const path = require("path");


const Event = require("../models/events");
const Feedback = require("../models/feedback");
const formatEventDate = require("../utils/format");
const rootDir = require("../utils/pathUtils");
const { bucket } = require("../utils/GCPupload");

exports.getIndex = async (req, res, next) => {
  const events = await Event.find().sort({ startDate: 1 }).limit(5).lean();
  res.render("commonPages/index", {
    pageTitle: "Home",
    currentPage: "Home",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
    events
  });
};

exports.getAboutUs = async (req, res, next) => {
  res.render("commonPages/aboutUs", {
    pageTitle: "About Us",
    currentPage: "About",
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
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).render("error/404", {
      pageTitle: "Page Not Found",
      currentPage: "",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
    const docUrl = event.docs[0];

    // Get only the object key (strip GCS prefix if full URL is stored)
    const filePath = docUrl.replace("https://storage.googleapis.com/eventra-files/", "");
    const file = bucket.file(filePath);

    const [exists] = await file.exists();
    console.log("File exists in GCS:", exists);

    const [files] = await bucket.getFiles({ prefix: "docs/" });
files.forEach(f => console.log(f.name));

    // Set headers to force download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=" + file.name.split("/").pop());

    // Pipe file stream to response
    file.createReadStream()
      .on("error", (err) => {
        console.error("Download error:", err);
        res.status(500).send("Download failed");
      })
      .pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).send("Download failed");
  }  
};
