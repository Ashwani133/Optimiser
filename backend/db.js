const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const User = new Schema({
    email:{type:String,unique:true},
    password:String,
    name:String
},{timestamps:true},)

const Todo = new Schema({
    taskId:String,
    title:String,
    detail:String,
    category:String,
    userId:ObjectId,
    dueDateTime:Date,
    },
    {timestamps:true},
)

const UserModel = mongoose.model("users",User);
const TodoModel = mongoose.model("todos",Todo);

module.exports = {
    UserModel:UserModel,
    TodoModel:TodoModel
}