const express = require('express');
const app = express();

const demo = require('./models/chat.js');//database for  all students
const User = require('./models/admin.js');//database for  admin accounts
const Student = require('./models/student.js');//database for  student password accounts

const mongoose = require('mongoose');
const methodOverride = require("method-override");
const path = require("path");
const session = require('express-session'); //beena session k hum flash ko use nahi kar sakte 
const flash = require('connect-flash'); //ye ek alert type ka message hota hai jo ki sirf ek bar dikhta hai by using session

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

function ensureStudentOwner(req, res, next) {
  const sid = req.session && req.session.studentId;
  const paramId = req.params && req.params.id;
  if (sid && paramId && String(sid) === String(paramId)) return next();
  req.flash('error', 'Unauthorized access');
  return res.redirect('/student');
}

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

//----------------------------------------------------- Particular student route
app.get("/student", (req, res) => {
  res.locals.flashmsg = req.flash("error");
  res.render("studentloginform.ejs");
})

app.post("/student", async (req, res) => { //----------------------show single student base on student login form
  let { ename, password } = req.body;

  const lists = await demo.findOne({ name: ename }).populate('passwords');
  if (lists) {
    const match = Array.isArray(lists.passwords) && lists.passwords.find(s => String(s.passwords) === String(password));
    if (match) {
      req.session.studentId = String(lists._id);
      req.session.studentName = lists.name;
      res.locals.flashmsg = req.flash("success");
      req.flash("success", ` Welcome to your account @${lists.name}`);
      return res.render("studentdetail.ejs", { lists });
    }
  }
  req.flash("error", "No such student exist..."); //-------------------wrong student credential than flash message
  return res.redirect("/student");
});

app.get('/student/:id', ensureStudentOwner, async (req, res) => {
  const { id } = req.params;

  const lists = await demo.findById(id).populate('passwords');

  res.locals.flashmsg = req.flash('success');
  return res.render('studentdetail.ejs', { lists });
});

app.get("/student/:id/edit", ensureStudentOwner, async (req, res) => {
  let { id } = req.params;
  const lists = await demo.findById(id);
  res.locals.flashmsg = req.flash('success');
  res.render("studentedit.ejs", { lists });
})

app.put("/student/:id/edit", ensureStudentOwner, async (req, res) => {
  let { id } = req.params;
  let { email, phone, address, passwords } = req.body;
  await demo.findByIdAndUpdate(id, { email, phone, address });
  if (passwords) {
    const demoDoc = await demo.findById(id).select('passwords name');
    const nameToUse = (req.session && req.session.studentName) || (demoDoc && demoDoc.name) || '';
    if (demoDoc && Array.isArray(demoDoc.passwords) && demoDoc.passwords.length > 0) {
      const existingId = demoDoc.passwords[0];
      await Student.findByIdAndUpdate(existingId, { name: nameToUse, passwords }, { new: true });
      if (demoDoc.passwords.length > 1) {
        await demo.findByIdAndUpdate(id, { $set: { passwords: [existingId] } });
      }
    } else {
      const stuser = new Student({ name: nameToUse, passwords });
      await stuser.save();
      await demo.findByIdAndUpdate(id, { $set: { passwords: [stuser._id] } });
    }
  }
  req.flash("success", " your details updated successfully!!");
  return res.redirect(`/student/${id}`);
})

//----------------------------------------------------------------------------------------------------------------------------------------
app.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please Login");
    return res.redirect("/login");
  }
  const lists = await demo.find().populate('passwords');
  const count = await demo.countDocuments();
  let admin = req.user.username;
  res.locals.flashmsg = req.flash("success");    // flash message    <<<<<-----------------------------------------------
  res.render("index.ejs", { lists, count, admin });
})

app.get("/signup", async (req, res) => {
  res.render("signup.ejs");
})

app.post("/signup", async (req, res) => {
  const count = await User.countDocuments();
  if (count < 2) {  // only 2 admin can exist for xyz school
    let { username, password, email } = req.body;
    const newUser = new User({
      username,
      email
    });
    const registerdUser = await User.register(newUser, password);//directly login after signup route 
    req.login(registerdUser, () => {
      req.flash("success", "welcome sir");
      res.redirect("/");
    })
  }
  else {
    req.flash("error", "Maximum 2 admin can exist for xyz school");
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.locals.flashmsg = req.flash("error");
  res.render("login.ejs");
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),//---------login as admin
  async (req, res) => {
    res.locals.flashmsg = req.flash("success", "welcome back chief");
    res.redirect("/")
  });


app.get("/logout", (req, res) => {
  // Passport logout then destroy session to ensure protected data isn't available via back button
  req.logout(function (err) {
    if (req.session) {
      req.session.destroy(function (err) {
        return res.redirect('/login');
      }
      );
    }
    else {
      return res.redirect('/login');
    }
  });
});

app.get("/del", async (req, res) => { // delete admin account when sign in
  if (!req.isAuthenticated()) {
    req.flash("error", "Please Login");
    return res.redirect("/login");
  }
  let adminname = req.user.username;
  const lists = await User.findOneAndDelete({ username: adminname });
  console.log(lists);
  req.flash("error", "account deleted. !!Please Signup")
  res.redirect("/login");
})

//--------------------------------------------------add new users
app.get("/data/new", (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Pleass Login !! To add users");
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
//--------------------------------------------------edit route for all students as admin

app.get("/data/:id/edit", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Login first to update  user data");
    return res.redirect("/login");
  }
  let { id } = await req.params;
  const lists = await demo.findById(id);
  res.render("edit.ejs", { lists });
})

app.put("/data/:id/edit", async (req, res) => {
  let { id } = req.params;
  let { name, email, phone, address, passwords } = req.body;
  await demo.findByIdAndUpdate(
    id,
    { email, phone, address }
  );
  if (passwords) {
    const demoDoc = await demo.findById(id).select('passwords');
    if (demoDoc && Array.isArray(demoDoc.passwords) && demoDoc.passwords.length > 0) {
      const existingId = demoDoc.passwords[0];
      await Student.findByIdAndUpdate(existingId, { name, passwords }, { new: true });
      if (demoDoc.passwords.length > 1) {
        await demo.findByIdAndUpdate(id, { $set: { passwords: [existingId] } });
      }
    } else {
      const stuser = new Student({ name, passwords });
      await stuser.save();
      await demo.findByIdAndUpdate(id, { $set: { passwords: [stuser._id] } });
    }
  }
  req.flash("success", " User details updated successfully!!");
  res.redirect(`/`);
})
//------------------------------------------------------delete route

app.delete("/data/:id/delete", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Pleass Login !! To delete users");
    return res.redirect("/login");
  }
  let { id } = req.params;
  // Remove student saved password with admin account while deleting student
  const demoDoc = await demo.findById(id).select('passwords');
  if (demoDoc && Array.isArray(demoDoc.passwords) && demoDoc.passwords.length > 0) {
    await Student.deleteMany({ _id: { $in: demoDoc.passwords } });
  }
  await demo.findByIdAndDelete(id);
  req.flash("success", "User data deleted successfully!!");
  res.redirect("/");
})

app.get('/students/logout', (req, res) => {
  if (req.session) {
    // remove student keys and destroy session to help prevent back-button access
    delete req.session.studentId;
    delete req.session.studentName;
    req.session.save(() => {
      req.flash("error", "Logout successfully!!");
      return res.redirect('/student');
    });
  } else {
    return res.redirect('/student');
  }
});
