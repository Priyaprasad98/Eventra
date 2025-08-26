//external module
const path = require("path");
const fs = require("fs");

//local module
const Event = require("../models/events");
const rootDir = require("../utils/pathUtils");

exports.getAddEvent = (req, res, next) => {
  res.render("admin/add-event",{
    isEdit: false,
    pageTitle: "Add-Event",
    currentPage: "Add-Event",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
  });
};

exports.getAdminEventList = async (req, res, next) => {
  try {
    const category = req.query.category || "All";
    const status = req.query.status || "All"; 
    let filter = {};

    // Category filter
    if (category !== "All") {
      filter.category = category;
    }

    // Fetch events
    let events = await Event.find().lean();  // <-- use 'let' to allow filtering
    const now = new Date();

    // Apply status filtering
    if (status === "Upcoming") {
      events = events.filter(e => new Date(e.startDate) > now);
    } else if (status === "Ongoing") {
      events = events.filter(e => {
        if (e.endDate) {
          return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
        } else {
          return new Date(e.startDate).toDateString() === now.toDateString();
        }
      }); 
    } else if (status === "Past") {
      events = events.filter(e => {
        if (e.endDate) {
          return new Date(e.endDate) < now;
        } else {
          return new Date(e.startDate) < now;
        }
      });
    }

    res.render("admin/event-list", {
      pageTitle: "Event-List",
      currentPage: "Event-List",
      events,
      filterCategory: category,
      filterStatus: status,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};



exports.postAddEvent = async (req, res, next) => {
  const {name,description,category,startDate,venue,organizer,organizerContactNumber,maxParticipants,registrationDeadline,fee} = req.body;
  const startDateObj = startDate ? new Date(startDate) : null;
  const registrationDeadlineObj = registrationDeadline ? new Date(registrationDeadline) : null;

  if(!req.files || !req.files.img || !req.files.img[0]) {
    return res.status(422).send("No image provided");
  } else if(!req.files.docs || !req.files.docs[0]) {
    return res.status(422).send("No docs for rule book provided");
  }
  const img = req.files.img[0].filename;
  const docs = req.files.docs[0].filename;
  const event = new Event({
    name, 
    description, 
    category, 
    startDate: startDateObj, 
    venue, 
    organizer,
    organizerContactNumber,
    maxParticipants: maxParticipants ? Number(maxParticipants) : 0,
    registrationDeadline: registrationDeadlineObj,
    fee: fee ? Number(fee) : 0,
    img,
    docs
  });
  try {
    await event.save();
      console.log("Event saved successfully!");
      res.redirect("/admin/events");
    }
   catch (err) {
        console.error(err);
        res.status(500).send("Error saving event");
    }
};

exports.postDeleteEvent = (req, res, next) => {
  const eventId = req.params.id;
  const redirectTo = req.body.redirectTo;
  Event.findByIdAndDelete(eventId).then(() => {
    res.redirect(redirectTo);
  }).catch(err => console.log(err));
};

exports.getEditEvent = (req, res, next) => {
  const eventId = req.params.id;
  Event.findById(eventId).then(event => {
    if(!event) return res.redirect("/admin/event-list");
    res.render("admin/add-event", { 
      event,
      isEdit : true,
      pageTitle: "Edit Event",
      currentPage: "Event-List",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
     });
  }).catch(err => console.log(err));
};

exports.postEditEvent = (req, res, next) => {
  const eventId = req.params.id;
  const {name,description,category,startDate,venue,organizer,organizerContactNumber,maxParticipants,registrationDeadline,fee} = req.body;
  Event.findById(eventId).then((event) => {
    event.name = name;
    event.description = description;
    event.category = category;
    event.startDate = startDate;
    event.venue = venue;
    event.organizer = organizer;
    event.organizerContactNumber = organizerContactNumber;
    event.maxParticipants = maxParticipants;
    event.registrationDeadline = registrationDeadline;
    event.fee = fee;
     if(req.files.img && req.files.img[0]) {
    const filePath = path.join(rootDir, 'uploads','img', event.img );
     fs.unlink(filePath, (err) => {
        if (err) {
          console.log("Error while deleting file ", err);
        }
      });
    event.img = req.files.img[0].filename;
  } 

   if(req.files.docs && req.files.docs[0]) {
    const filePath = path.join(rootDir, 'uploads','docs', event.docs );
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("Error while deleting file ", err);
      }
    });
    event.docs = req.files.docs[0].filename;
  }
  event.save().then(() => {
    console.log("event edited sucessfully");
  })
  .catch(err => {
    console.log("Error while updating", err);
  })
  res.redirect("/admin/event-list");
  }) .catch(err => {
    console.log("Error while finding home", err);
  });

};

exports.getAdminEventCards = async (req, res, next) => {
  const events = await Event.find().lean();
  const now = new Date();

  const upcoming = events.filter(e => new Date(e.startDate) > now);
  const ongoing  = events.filter(e => {
    if (e.endDate) {
      return new Date(e.startDate) <= now && new Date(e.endDate) >= now;
    } else {
      return new Date(e.startDate).toDateString() === now.toDateString();
    }
  });
  const past = events.filter(e => new Date(e.endDate || e.startDate) < now);

  res.render("commonPages/events", { 
    upcoming, ongoing, past,
    pageTitle: "Events",
    currentPage: "Events",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
  });
};
