const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id:userOneId,
    name:"Mike",
    email:"mike@email.com",
    password:"100%what?",
    tokens:[
        {token:jwt.sign({_id:userOneId},process.env.JWT_TOKEN_SECRET)}
    ]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id:userTwoId,
    name:"Leo",
    email:"leo@email.com",
    password:"99%what?",
    tokens:[
        {token:jwt.sign({_id:userTwoId},process.env.JWT_TOKEN_SECRET)}
    ]
};

const taskOne = {
    _id:new mongoose.Types.ObjectId(),
    description:"Task 1 user 1",
    completed:false,
    owner:userOneId
}

const taskTwo = {
    _id:new mongoose.Types.ObjectId(),
    description:"Task 2 user 1",
    completed:true,
    owner:userOneId
}

const taskThree = {
    _id:new mongoose.Types.ObjectId(),
    description:"Task 3 user 2",
    completed:true,
    owner:userTwoId
}

const setupDatabase = async()=>{
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
} 

module.exports = {
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}