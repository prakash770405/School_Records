const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('./models/admindatabase.js');
const demo = require('./models/chat.js');
const Student = require('./models/student.js');

// Middleware to check if an admin is authenticated
function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login to access this page.");
    res.redirect("/login");
}

// Admin Dashboard
router.get("/", isAdmin, async (req, res) => {
    try {
        const lists = await demo.find().populate('passwords');
        const count = await demo.countDocuments();
        let admin = req.user.username;
        res.locals.flashmsg = req.flash("success");
        res.render("index.ejs", { lists, count, admin });
    } catch (err) {
        req.flash("error", "Could not load student data.");
        res.redirect("/");
    }
});

// Admin Signup
router.get("/signup", (req, res) => {
    res.render("signup.ejs");
});

router.post("/signup", async (req, res) => {
    try {
        const count = await User.countDocuments();
        if (count < 2) {
            let { username, password, email } = req.body;
            const newUser = new User({ username, email });
            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", "Welcome, Admin!");
                return res.redirect("/");
            });
        } else {
            req.flash("error", "Maximum 2 admin accounts can exist.");
            res.redirect("/login");
        }
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
});

// Admin Login
router.get("/login", (req, res) => {
    res.locals.flashmsg = req.flash("error");
    res.render("login.ejs");
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res) => {
    req.flash("success", "Welcome back, Admin!");
    res.redirect("/");
});

// Admin Logout
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.redirect('/login');
        });
    });
});

// Delete Admin Account
router.get("/del", isAdmin, async (req, res) => {
    let adminname = req.user.username;
    await User.findOneAndDelete({ username: adminname });
    req.flash("error", "Admin account deleted. Please sign up again if needed.");
    res.redirect("/login");
});

// Add New Student
router.get("/data/new", isAdmin, (req, res) => {
    res.render("newuser.ejs");
});

router.post("/new", isAdmin, async (req, res) => {
    let { name, stdclass, address, email, phone } = req.body;
    let newuser = new demo({ name, stdclass, address, email, phone });
    await newuser.save();
    req.flash("success", "New student added successfully!");
    res.redirect("/");
});

// Edit Student
router.get("/data/:id/edit", isAdmin, async (req, res) => {
    let { id } = req.params;
    const lists = await demo.findById(id);
    res.render("edit.ejs", { lists });
});

router.put("/data/:id/edit", isAdmin, async (req, res) => {
    let { id } = req.params;
    let { name, email, phone, address, passwords } = req.body;
    await demo.findByIdAndUpdate(id, { email, phone, address });
    if (passwords) {
        const demoDoc = await demo.findById(id).select('passwords');
        if (demoDoc && demoDoc.passwords.length > 0) {
            const existingId = demoDoc.passwords[0];
            await Student.findByIdAndUpdate(existingId, { name, passwords }, { new: true });
        } else {
            const stuser = new Student({ name, passwords });
            await stuser.save();
            await demo.findByIdAndUpdate(id, { $set: { passwords: [stuser._id] } });
        }
    }
    req.flash("success", "User details updated successfully!");
    res.redirect(`/`);
});

// Delete Student
router.delete("/data/:id/delete", isAdmin, async (req, res) => {
    let { id } = req.params;
    const demoDoc = await demo.findById(id).select('passwords');
    if (demoDoc && demoDoc.passwords.length > 0) {
        await Student.deleteMany({ _id: { $in: demoDoc.passwords } });
    }
    await demo.findByIdAndDelete(id);
    req.flash("success", "User data deleted successfully!");
    res.redirect("/");
});

module.exports = router;