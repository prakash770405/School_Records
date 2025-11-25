if(process.env.NODE_ENV !="production"){
require('dotenv').config()
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const path = require("path");
const session = require('express-session'); //beena session k hum flash ko use nahi kar sakte 
const MongoStore = require('connect-mongo');

const flash = require('connect-flash'); //ye ek alert type ka message hota hai jo ki sirf ek bar dikhta hai by using session

const User = require('./models/admindatabase.js');//database for  admin accounts
const adminRoutes = require('./admin.js');
const studentRoutes = require('./student.js');
const dbUrl=process.env.MONGO_URL;
const cookieCode=process.env.COOKIE;
const passport = require('passport');
const localStrategy = require('passport-local');

// Note: avoid enabling connect-mongo's built-in crypto here unless you
// have a working kruptein configuration. Passing `crypto` without a
// compatible implementation can lead to runtime errors when sessions
// are encrypted/decrypted (see connect-mongo internals). Leave crypto
// out for now and rely on the session secret below.
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
});


app.use(session({ store:store,secret: cookieCode, resave: false, saveUninitialized: false }))
app.use(flash());//humesha session create karne k baad flash ko use kare 

app.use(passport.initialize());
app.use(passport.session());



passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

main()
  .then((result) => { console.log("database connected"); })
  .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/mydemo');
// }

async function main() {
  await mongoose.connect(dbUrl);
}



app.listen(8080, (req, res) => {
  console.log(`app is listening on port http://localhost:8080`);
})

// Use Routers
app.use('/student', studentRoutes);
app.use('/', adminRoutes);
