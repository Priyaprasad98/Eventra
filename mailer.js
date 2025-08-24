const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const tranporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

const sendMail = async(to, subject, htmlContent,event) => {
  try {
    await tranporter.sendMail({
      from: `"Eventra" <${process.env.APP_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: event.img,  
          path: path.join(__dirname,"uploads/img", event.img), // your uploads folder
          cid: "eventPoster"
        }
       ]
    });
    console.log("Email sent sucessfully to", to);
  } catch(err) {
    console.log("Error sending email:",err);
  }
};

module.exports = sendMail;