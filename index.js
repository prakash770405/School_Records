const express = require('express');
const app = express();
const demo = require('./models/chat.js');
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const path = require("path");
const session = require('express-session'); //beena session k hum flash ko use nahi kar sakte 
const flash = require('connect-flash'); //ye ek alert type ka message hota hai jo ki sirf ek bar dikhta hai by using session

const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/admin.js');


app.use(session({ secret: "mysupersecretstring", resave: false, saveUninitialized: true }))
app.use(flash());//humesha session create karne k baad flash ko use kare 

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
// passport-local-mongoose exposes helper functions that return the
// actual serialize/deserialize functions, so call them here.
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

//  app.get("/demouser", async(req,res)=>{
//  let fakeUser=new User({
//               email:"aaa@gmail.com",
//               username:"abcd"
//                        });

// let RegisterdUser= await User.register(fakeUser,"pass");
// res.send(RegisterdUser);
// });

app.listen(8080, (req, res) => {
  console.log(`app is listening on port http://localhost:8080`);
})

app.get("/", async (req, res) => {
   if(!req.isAuthenticated()){
    req.flash("error","Please Login");
    return res.redirect("/login");
  }
  const lists = await demo.find();
  const count = await demo.countDocuments();

  res.locals.flashmsg = req.flash("success");    // flash message    <<<<<-----------------------------------------------

  res.render("index.ejs", { lists, count });
})


app.get("/signup", (req, res) => {
  res.render("signup.ejs");
})

app.post("/signup", async(req, res) => {
    let { username, password, email } = req.body;
    const newUser = new User({
      username,
      email
    });
    const registerdUser = await User.register(newUser, password);
    console.log(registerdUser);
    req.flash("success", "User registered successfully");
    res.redirect("/");
});

app.get("/login", (req,res)=>{
  // passport sets messages under the 'error' key by default when
  // failureFlash is enabled — fix typo so messages appear.
  res.locals.flashmsg = req.flash("error");
  res.render("login.ejs");
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
async (req,res)=>{
res.locals.flashmsg = req.flash("success","welcome back chief");
res.redirect("/")
});


app.get("/logout",(req,res)=>{
  req.logout(()=>{
  req.flash("error", "You Logout successfully"); 
   res.redirect("/login");
  })
});
//--------------------------------------------------add new users
app.get("/data/new", (req, res) => {
     if(!req.isAuthenticated()){
    req.flash("error","Pleass Login !! To add users");
    return res.redirect("/login");
  }
  res.render("newuser.ejs");
})

app.post("/new", (req, res) => {
  let { name, stdclass, address, email, phone, dates } = req.body;
  let newuser = new demo({
    name,
    stdclass,
    address, email, phone, dates,
  });
  newuser.save()
    .then(result => { console.log(result); })
    .catch(err => { console.log(err); })

  req.flash("success", "New student added successfully!!"); // iss flash message me "added" naam se key hai aur uski value me message hai jo dikhana hai

  res.redirect("/");
})
//--------------------------------------------------edit address 

app.get("/data/:id/edit", async (req, res) => {
  if(!req.isAuthenticated()){
    req.flash("error","Login first to update  user data");
    return res.redirect("/login");
  }
  let { id } = await req.params;
  const lists = await demo.findById(id);
  res.render("edit.ejs", { lists });
})

app.put("/data/:id/edit", async (req, res) => {
  let { id } = req.params;
  let { email, phone, address } = req.body;
  await demo.findByIdAndUpdate(
    id,
    { email, phone, address }
  );
  req.flash("success", " User details updated successfully!!");
  res.redirect("/");
})
//------------------------------------------------------delete route

app.delete("/data/:id/delete", async (req, res) => {
    if(!req.isAuthenticated()){
    req.flash("error","Pleass Login !! To delete users");
    return res.redirect("/login");
  }
  let { id } = await req.params;
  const lists = await demo.findById(id);
  await demo.findByIdAndDelete(id);
  req.flash("success", "User data deleted successfully!!");
  res.redirect("/");
})