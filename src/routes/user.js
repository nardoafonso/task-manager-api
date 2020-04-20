const express = require("express");
const User = require("../models/user");
const auth = require('../middleware/auth-middleware');
const multer = require('multer');
const upload =  multer({
  dest:'images'
});
const router = new express.Router();

router.post("/users" , async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(200).send({user,token});
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/logout", auth, async (req,res)=>{
  try{
    req.user.tokens = req.user.tokens.filter((token)=>{
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  }catch(e){
      res.status(500).send();
  }
});

router.post("/users/logoutAll",auth,async(req,res)=>{
  try{
    req.user.tokens = [];
    await req.user.save();
    res.send();
  }catch(e){
    res.status(500).send();
  }
});

router.post("/users/login", async(req,res)=>{
    try{
      const user = await User.findByCredentials(req.body.email, req.body.password);
      const token = await user.generateAuthToken();
      res.send({user,token});
    }catch(e){
      res.status(400).send();
    }
});

router.get("/users/me", auth, async (req, res) => {
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (e) {
  //   res.status(500).send();
  // }
  res.send(req.user);
});

router.post("/users/me/avatar", upload.single("avatar"),async (req,res)=>{
  res.send();
});

// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;
//   try {
//     const user = await User.findById(_id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

router.patch("/users/me", auth ,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((up) => allowedUpdates.includes(up));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Operation" });
  }

  try {
    // const user = await User.findById(req.params.id);
    updates.forEach((up) => req.user[up] = req.body[up]);
    await req.user.save();
    //const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      //new: true, //return the updated user
      //runValidators: true, //run validator on req body
    //}); cant do find and update when using middlewares

    // if (!user) {
    //   return res.status(404).send();
    // }
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
