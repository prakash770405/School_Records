const mongoose=require("mongoose");

const studentSchema= new mongoose.Schema({
    name: String,
    passwords: String
});
module.exports=mongoose.model("Student",studentSchema);