const mongoose=require('mongoose');


const demoSchema = new mongoose.Schema({
  name: String,
  stdclass: Number,
  email: String,
  phone: Number,
  address: String,
  dates: { type: Date, default: Date.now },
  passwords:[
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    }]
});

const Demo = mongoose.model('Demo', demoSchema);
module.exports=Demo;