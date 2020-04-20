const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require('./task');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password must not contain 'password'");
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be positive number");
      }
    },
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }]
},{
  timestamps:true
});

userSchema.virtual('tasks',{
  ref:"Task", //virtual, not stored on database
  localField:"_id", //field on this model
  foreignField:"owner" //field on the task model
});

userSchema.methods.toJSON = function(){
  const userObj = this.toObject();
  
  delete userObj.password;
  delete userObj.tokens;

  return userObj ;
}

userSchema.methods.generateAuthToken = async function(){
  const token = jwt.sign({_id:this._id.toString()}, "thisismysecret")
  this.tokens = this.tokens.concat({token});
  await this.save();
  return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to Login");
  }

  return user;
};

//hash the plain text password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

//delete user task when user is removed
userSchema.pre("remove", async function(next){
  await Task.deleteMany({owner:this._id});
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
