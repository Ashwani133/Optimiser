const express = require("express");
const path = require('path');
const app = express();
var jwt = require('jsonwebtoken');
const JWT_SECRET = "AshwaniKaushik123@123"
app.use(express.json());

const users = [];

app.use(express.static('../'));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'landing.html'));
})

app.get("/signup", function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'signup.html'))
})


app.post("/signup",function(req,res){
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    users.push({
        username:username,
        email:email,
        password:password
    })

    res.json({
        message:"You are signed up!"
    })
})

app.get("/signin", function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'signin.html'))
})

app.post("/signin",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    const foundUser = users.find((u)=>u.username === username && u.password === password);
    if(foundUser){
        const token = jwt.sign({
            username:foundUser.username
        },JWT_SECRET);

        // res.header("jwt",token);
        // req.header("jwt",token);
        // res.header("random","ashwani");
        // req.token = token;
        res.send({
            token:token
        })
        
    }else{
        res.send({
            message:"Invalid username or password!"
        })
    }
})

function auth(req,res,next){
    console.log("token is: ",req.headers.token);
    const token = req.headers.token;
    const decodedData = jwt.verify(token,JWT_SECRET)
    if(decodedData.username){
        next()
    }else{
        res.json({
            message:"You are not logged in!"
        })
    }
}

app.get("/todo",function(req,res){
    const filePath = path.join(__dirname, '../', 'todo.html');
    res.sendFile(filePath);
});

app.get("/me",auth,function(req,res){
    res.json({
        message:"You are logged in through me!"
    })
})

app.listen(3000);