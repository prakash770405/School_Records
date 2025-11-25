const express = require('express');
const router = express.Router();
const demo = require('./models/chat.js');
const Student = require('./models/student.js');

// Middleware to ensure the logged-in student can only access their own data
function ensureStudentOwner(req, res, next) {
    const sid = req.session && req.session.studentId;
    const paramId = req.params && req.params.id;
    if (sid && paramId && String(sid) === String(paramId)) {
        return next();
    }
    req.flash('error', 'Unauthorized access');
    return res.redirect('/student');
}

// Student Login
router.get("/", (req, res) => {
    res.locals.flashmsg = req.flash("error");
    res.render("studentloginform.ejs");
});

router.post("/", async (req, res) => {
    let { ename, password } = req.body;
    const student = await demo.findOne({ name: ename }).populate('passwords');
    if (student) {
        const match = student.passwords.find(p => String(p.passwords) === String(password));
        if (match) {
            req.session.studentId = String(student._id);
            req.session.studentName = student.name;
            req.flash("success", `Welcome to your account, @${student.name}`);
            return res.redirect(`/student/${student._id}`);
        }
    }
    req.flash("error", "Invalid username or password.");
    return res.redirect("/student");
});

// View Student Dashboard
router.get('/:id', ensureStudentOwner, async (req, res) => {
    const { id } = req.params;
    const student = await demo.findById(id).populate('passwords');
    res.locals.flashmsg = req.flash('success');
    return res.render('studentdetail.ejs', { lists: student });
});

// Edit Student Profile
router.get("/:id/edit", ensureStudentOwner, async (req, res) => {
    let { id } = req.params;
    const student = await demo.findById(id);
    res.locals.flashmsg = req.flash('success');
    res.render("studentedit.ejs", { lists: student });
});

router.put("/:id/edit", ensureStudentOwner, async (req, res) => {
    let { id } = req.params;
    let { email, phone, address, passwords } = req.body;
    await demo.findByIdAndUpdate(id, { email, phone, address });
    if (passwords) {
        const demoDoc = await demo.findById(id).select('passwords name');
        const nameToUse = req.session.studentName || demoDoc.name;
        if (demoDoc && demoDoc.passwords.length > 0) {
            await Student.findByIdAndUpdate(demoDoc.passwords[0], { name: nameToUse, passwords });
        } else {
            const stuser = new Student({ name: nameToUse, passwords });
            await stuser.save();
            await demo.findByIdAndUpdate(id, { $set: { passwords: [stuser._id] } });
        }
    }
    req.flash("success", "Your details were updated successfully!");
    return res.redirect(`/student/${id}`);
});

// Student Logout
router.get('/logout', (req, res, next) => {
    // Regenerate the session to ensure a clean state after logout.
    req.session.regenerate(function(err) {
        if (err) return next(err);
        req.flash('success', 'You have been logged out.');
        res.redirect('/student');
    });
});

module.exports = router;