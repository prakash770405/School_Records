const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const path = require("path");
const session = require('express-session'); //beena session k hum flash ko use nahi kar sakte 
const flash = require('connect-flash'); //ye ek alert type ka message hota hai jo ki sirf ek bar dikhta hai by using session

const User = require('./models/admindatabase.js');//database for  admin accounts
const adminRoutes = require('./admin.js');
const studentRoutes = require('./student.js');

const passport = require('passport');
const localStrategy = require('passport-local');


app.use(session({ secret: "mysupersecretstring", resave: false, saveUninitialized: true }))
app.use(flash());//humesha session create karne k baad flash ko use kare 

app.use(passport.initialize());
app.use(passport.session());

// Prevent pages from being cached by the browser so the back button won't show protected data after logout
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

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

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mydemo');
}

app.listen(8080, (req, res) => {
  console.log(`app is listening on port http://localhost:8080`);
})

// Use Routers
app.use('/student', studentRoutes);
app.use('/', adminRoutes);
