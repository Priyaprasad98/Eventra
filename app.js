//Core Module
const path = require("path");

//External Module
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const connectMongoDBSession = require("connect-mongodb-session"); //function
const sessionStore = connectMongoDBSession(session); //class

//local module
const commonRouter = require("./routes/commonRouter");
const studentRouter = require("./routes/studentRouter");
const adminRouter = require("./routes/adminRouter");
const authRouter = require("./routes/authRouter");
const errorController = require("./controllers/errorController");
const rootdir = require("./utils/pathUtils");

require('dotenv').config();
const DB_PATH = process.env.DB_PATH;

const app = express();

// View engine setup 
app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));

const store= new sessionStore({
  uri: DB_PATH,
  collection: "sessions"
});

app.use(session({
  secret: "eventra",
  resave: false,
  saveUninitialized: true,
  store: store //session will now save in store rather than memory
}));

app.use(express.urlencoded({ extended: true }));

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname === 'img') {
      cb(null, "uploads/img");
    } else if(file.fieldname === 'docs') {
      cb(null, 'uploads/docs/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) =>  {
  if(file.fieldname === 'img') {
     if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
       cb(null, true);
     } else {
       cb(null, false);
     }
  } else if (file.fieldname === 'docs') {
    if (file.mimetype === 'application/pdf') {
       cb(null, true);
     } else {
       cb(null, false);
     }
  }
 
}

const multerOptions = { 
  storage, fileFilter
};

app.use(multer(multerOptions).fields([
  { name: 'img', maxCount: 1 },
  { name: 'docs', maxCount: 1 }
]));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(rootdir,"public")));
app.use("/uploads", express.static(path.join(rootdir,"uploads/")));



app.use((req,res,next) => {
  console.log(req.url,req.method);
  next();  
});

app.use( (req,res,next)=> {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});
app.use(commonRouter);
app.use(studentRouter);
app.use(authRouter);
app.use("/admin",adminRouter);
app.use(errorController.get404);

const port = 3020;
mongoose.connect(DB_PATH).then(() => {
  app.listen(port, "0.0.0.0",() => {
  console.log(`server is running on http://localhost:${port}`);
});
}).catch((err)=> {
  console.log("error while connecting to mongo:",err);
});