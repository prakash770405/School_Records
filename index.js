const express = require('express');
const app=express();
const demo=require('./models/chat.js');
const mongoose = require('mongoose');
const methodOverride=require("method-override");
const path=require("path");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

main()
.then((result)=>{console.log("database connected");})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mydemo');
}

// const user1  = new demo({ 
//     name: "hanuman",
//     stdclass: 17,
//     phone: 3536727222,
//     email: "123@ajakkagmail.com"
//     address: "ashoknagar",
//  });
// user1.save()
// .then((result)=>{console.log(result);})
// .catch((err)=>{console.log(err);});



app.listen(8080,(req,res)=>{
    console.log(`app is listening on port https://localhost:8080`);
})
app.get("/",async (req,res)=>{
    const lists= await demo.find();
    const count=await demo.countDocuments();
    res.render("index.ejs",{lists,count});
})
//--------------------------------------------------add new users
app.get("/data/new", (req,res)=>{
    res.render("newuser.ejs");
})
app.post("/new", (req,res)=>{
  let {name,stdclass,address,email,phone,dates}=req.body;
  let newuser = new demo({
    name,
    stdclass,
    address,email,phone,dates,
  });
newuser.save()
.then(result=>{console.log(result);})
.catch(err=>{console.log(err);})
res.redirect("/");
})
//--------------------------------------------------edit address 

app.get("/data/:id/edit",async(req,res)=>{
  let {id}= await req.params;
  const lists= await demo.findById(id);
  console.log(lists);
    res.render("edit.ejs",{lists});
})

app.put("/data/:id/edit", async (req,res)=>{
 let {id}=  req.params;
 let {email,phone,address}=  req.body;
 console.log(email,phone,address);
await demo.findByIdAndUpdate(
   id,
  {email,phone,address}
);
res.redirect("/");
})
//------------------------------------------------------delete route

app.delete("/data/:id/delete",async(req,res)=>{
  let {id}= await req.params;
  const lists= await demo.findById(id);
  console.log(lists);
  await demo.findByIdAndDelete(id);
  res.redirect("/");
})
