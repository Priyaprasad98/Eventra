const mongoose = require("mongoose");

const Event = require("../models/events");
const Registration = require("../models/registrations");
const Feedback = require("../models/feedback");
const sendMail = require("../mailer");
const formatEventDate = require("../utils/format");

exports.getEvents = async (req, res, next) => {
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

exports.getRegistrationForm = async (req, res, next) => {
  const eventId = req.params.eventId;
  //const status = req.query.status;
  //console.log(status);
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    } 
    res.render("student/registration", {
      pageTitle: "Register",
      currentPage: "Events",
      event,
      query: req.query,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user
    }); 
  }
  catch(err) {
    console.log("Error while finding Event to Register", err);
  }
};

exports.postRegistrationForm = async (req,res,next) => {
  console.log(req.body);
  const {studentName, studentEmail, studentPhoneNo, studentDepartment, registeredAt} = req.body;
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    const existing = await Registration.findOne({      
      eventId: new mongoose.Types.ObjectId(eventId),
      studentEmail 
    });
    if (existing) {
      // Redirect with already registered query
      return res.redirect(`/register/${eventId}?status=already`);
    }
    const registration = new Registration({
    eventId: new mongoose.Types.ObjectId(eventId),
    studentName,
    studentEmail,
    studentPhoneNo,
    studentDepartment,
    registeredAt
    });
   await registration.save();
      //send immediate confirmation email
      const confirmationHTML = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color:#6B46C1;">Hi ${studentName},</h2>
          <p>Thank you for registering for <strong>${event.name}</strong>! 🎉</p>

          <div style="margin:20px 0;">
           <img src= "cid:eventPoster" alt="Event Poster" style="width:100%; max-width:400px; border-radius:10px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          </div>

          <h3 style="color:#6B46C1;">Event Details:</h3>
          <ul>
            <li>📅 <strong>Date:</strong> ${event.startDate.toDateString()}</li>
            <li>🕒 <strong>Time:</strong> ${formatEventDate(event.startDate)}</li>
            <li>📍 <strong>Venue:</strong> ${event.venue}</li>
            <li>👤 <strong>Organized by:</strong> ${event.organizer}</li>
          </ul>

          <p style="background:#f3f4f6; padding:15px; border-radius:8px;">
            Please make sure to arrive 15 minutes before the event starts. Bring your student ID and registration confirmation.
          </p>

          <p style="margin-top:20px;">
            For any queries, contact us at <a href="mailto:${process.env.APP_EMAIL}" style="color:#6B46C1;">${process.env.APP_EMAIL}</a>.
          </p>

          <p style="margin-top:20px; font-size:0.9em; color:#666;">
            Looking forward to seeing you at the event! <br>
            — Eventra 
          </p>
        </div>
      `;
      await sendMail(studentEmail, `Registration Confirmation: ${event.name}`, confirmationHTML,event);

      res.redirect(`/thank-you?eventId=${eventId}&name=${encodeURIComponent(studentName)}&email=${encodeURIComponent(studentEmail)}`);
    }  
    catch(err) {
      console.error(err);
      res.redirect(`/register/${req.params.id}?status=error`);
  }
};

exports.getFeedback = async (req, res, next) => {
  const eventId = req.params.eventId;
  event = await Event.findById(eventId);
  res.render("student/feedback", {
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
    pageTitle: "Feedback",
    currentPage: "Events",
    query: req.query,
    event: event
  });
  
};

exports.postFeedback = async (req, res, next) => {
  console.log(req.body);
  const eventId = req.params.eventId;
  const {rating,comment,studentEmail,studentName} = req.body;
  
  try {
    const registeredStudent = await Registration.findOne({
      eventId: new mongoose.Types.ObjectId(eventId), 
      studentEmail
    });
    console.log(registeredStudent);
    if(!registeredStudent) {
      return res.redirect(`/feedback/${eventId}?status=NotRegistered`);
    }
    else if(registeredStudent.isFeedbackSubmitted) {
      return res.redirect(`/feedback/${eventId}?status=already`);
    }
    else {
        const feedback = new Feedback({
          eventId: new mongoose.Types.ObjectId(eventId),
          registeredStudentId: registeredStudent._id,
          studentName,
          rating,
          comment
        });
        await feedback.save();
        registeredStudent.isFeedbackSubmitted = true;
        await registeredStudent.save();
        res.redirect(`/events/${eventId}?status=success`);
      }
  }
  catch(err) {
    console.log("Error saving feedback:",err);
  }  
};

exports.getThankYou = async (req, res, next) => {
  const { eventId, name, email } = req.query;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    }

    res.render("student/thank-you", {
      event,
      studentName: name,
      studentEmail: email,
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
      pageTitle: "Registration Successfull",
      currentPage:""
    });
  } catch (err) {
    console.error(err);
    res.redirect("/events");
  }
};

