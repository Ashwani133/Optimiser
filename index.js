const express = require("express");
const path = require('path');
var jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const {UserModel, TodoModel} = require("./backend/db")
const {z} = require("zod");
const bcrypt = require("bcrypt");
require('dotenv').config();

console.log(process.env.MONGO_URL);

mongoose.connect(process.env.MONGO_URL)

const app = express();
app.use(express.json());


app.use(express.static('./public'));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname,'./public/index.html'));
})

app.get("/signup", function (req, res) {
    res.sendFile(path.join(__dirname, './public/signup.html'))
})


app.post("/signup",async function(req,res){

    //Input validations
    const requiredBody = z.object({
        email:z.string().min(6).max(100).email(),
        name:z.string().min(3).max(100),
        password:z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/\d/, { message: "Password must contain at least one digit" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
    })

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    //Data doesn't pass the validation tests
    if(!parsedDataWithSuccess.success){
        res.status(400).json({
            message:"Incorrect Format",
            error:parsedDataWithSuccess.error.issues[0].message
        })
        return;
    }


    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    
    //hash Password before storing it using salt in db
    let errorThrown = false;
    try {
        const hashedPassword = await bcrypt.hash(password,10);

        await UserModel.create({
            email:email,
            name:name,
            password:hashedPassword
        })
        res.status(201).json({
            message:"You are signed up!"
        })
        errorThrown = true;

    }catch(e){
        res.json({
            message:"User already exists!"
        })
    }

    if(!errorThrown){
        res.status(500).json({
            message: "Internal server error"
        });
    }

})


app.get("/signin", function (req, res) {
    res.sendFile(path.join(__dirname, './public/signin.html'))
})

let currentUserId = new mongoose.Types.ObjectId();//Use it while creating task to link it with userId
app.post("/signin",async function(req,res){

    const loginBodySchema = z.object({
        email: z.string().email().min(6, "Email must be at least 6 characters long").max(100, "Email is too long"),
        password: z.string().min(8, "Password must be at least 8 characters long")
    })

    const parsedLoginData = loginBodySchema.safeParse(req.body);
    if(!parsedLoginData){
        res.status(400).json({
            message: "Invalid input",
            error: parsedData.error.issues[0].message
        })
        return;
    }
    const email = req.body.email.trim().toLowerCase();;
    const password = req.body.password;
    
    try{
        const response = await UserModel.findOne({
            email:email
        }) 
    
        if(!response){
            res.status(403).json({
                message:"User does not exist!"
            })
            return
        }
    
        const passwordMatched = await bcrypt.compare(password,response.password);
        
        if(passwordMatched){
            const token = jwt.sign({
                id:response._id
            },process.env.JWT_SECRET);
    
            res.send({
                token:token
            })
            currentUserId = response._id; // to save the current user Id to link it to his/her tasks later
        }else{
            res.status(403).send({
                message:"Invalid username or password!"
            })
        }
    }catch(e){
        console.error(e);
        res.status(500).json({
            message: "Internal server error",
            error: e.message
        });
    }
})

function auth(req,res,next){
    const token = req.headers.token;
    const decodedData = jwt.verify(token,process.env.JWT_SECRET)
    if(decodedData){
        next()
    }else{
        res.json({
            message:"You are not logged in!"
        })
    }
}

app.get("/todo",async function(req,res){
    const filePath = path.join(__dirname, './public/todo.html');
    res.sendFile(filePath);
});

app.get("/me",auth,async function(req,res){
    const email = req.headers.email;
    const user = await UserModel.find({email:email})
    const tasks = await TodoModel.find({userId:user[0]._id});
    res.send(tasks);
})

app.post("/todo",async function(req,res){
        //inputs from body
        const taskId = req.body.taskId;
        const taskTitle = req.body.title;
        const taskDetail = req.body.detail;
        const taskCategory = req.body.category;
        const dueDateTime = req.body.dueDateTime;
        await TodoModel.create({
            taskId:taskId,
            title:taskTitle,
            detail:taskDetail,
            category:taskCategory,
            userId:currentUserId,
            dueDateTime:dueDateTime
        })

        res.json({
            message:"task is created"
        })
})

app.put("/todo/:taskId", async function(req,res){
    const {taskId} = req.params;
    const filter = {taskId:taskId};

    const update = {
        taskId:taskId,
        title:req.body.title,
        detail:req.body.detail,
        category:req.body.category
    }
    
    await TodoModel.findOneAndUpdate(filter, update,{ new: true });
    res.json({
        message:"Task updated!"
    })
})

app.put("/todo/drag/:taskId", async function(req, res){
    const {taskId} = req.params;
    const filter = {
        taskId:taskId
    };
    const category = req.body.category;
    const update = {
        taskId:taskId,
        category:category
    }
    
    await TodoModel.findOneAndUpdate(filter, update,{ new: true });
    res.json({
        message:"Task updated!"
    })
})

app.delete("/todo/:taskId",async function(req,res){
    const {taskId} = req.params;
    await TodoModel.deleteOne({taskId:taskId})
    res.json({
        message:"Task deleted successfully!"
    })
})

app.listen(3000);