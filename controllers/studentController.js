const Event = require("../models/events");
const Registration = require("../models/registrations");
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
    currentPage: "Events"
   });
};

exports.getRegistrationForm = async (req, res, next) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    } 
    res.render("student/registration", {
      pageTitle: "Register",
      currentPage: "Events",
      event,
      query: req.query
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
   const existing = await Registration.findOne({ eventId, studentEmail });
    if (existing) {
      // Redirect with already registered query
      return res.redirect(`/register/${eventId}?status=already`);
    }
  const registration = new Registration({
    eventId,
    studentName,
    studentEmail,
    studentPhoneNo,
    studentDepartment,
    registeredAt
  });
  try {
   await registration.save();
     console.log("Registration done successfully!");
     res.redirect(`/register/${eventId}?status=success`);

     const event = await Event.findById(eventId);
     if(!event) {
      return res.status(404).send("Event not found");
     }
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
     }  
    catch(err) {
      console.error(err);
      res.redirect(`/register/${req.params.id}?status=error`);
  }
};

