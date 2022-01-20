var express = require('express');
var bodyParser = require('body-parser');
const mysql = require('mysql')
var app = express();
const path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
  
app.use(bodyParser.urlencoded({ extended: false }))


app.use(bodyParser.json())
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'/public')));

app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!",saveUninitialized:true, resave: false}));

const db  = mysql.createConnection({
    host            : 'localhost',
    user            : 'root',
    password        : '08019899',
    database        : 'practice'
})

db.connect((err)=>{
    if(err) throw err
    console.log("Connected to db")
})

app.get('/',(req,res) => {
    res.render("home")
});

app.all('/admin',(req,res) => {

     if(req.method=="POST"){
        const params = req.body;

        const sql = `SELECT adminID FROM admin WHERE adminUName="${params.adminUName}" AND adminPass="${params.adminPass}"`;

        db.query(sql, (err,results)=>{
            if(err) throw err;
            console.log(results)

            if(results.length==0){
               res.render("admin",{error:true})
            }

            else if(results.length>0){
                res.redirect("/adminPage")
            }
        })

    } else{
        res.render("admin",{error:false})
    }

});

app.get('/adminPage',(req,res) => {
    res.render("adminPage")
});

app.all('/guest',(req,res) => {

    if(req.method=="POST"){
        const params = req.body;

        const sql = `SELECT guestID FROM guest WHERE guestUname="${params.guestUname}" AND guestPass="${params.guestPass}"`;

        db.query(sql, (err,results)=>{
            if(err) throw err;
            console.log(results)

            if(results.length==0){
               res.render("guest",{error:true})
            }

            else if(results.length>0){
                res.redirect("/dashboard")
            }
        })

    } else{
        res.render("guest",{error:false})
    }

});

app.all('/guestSignUp',(req,res) => {

     if (req.method == "POST"){

        const params = req.body;

        const sql = "INSERT INTO guest SET ?";

        db.query(sql, params, (err,result)=>{

            if(err) throw err;

            db.query("SELECT LAST_INSERT_ID() as id",(err1,result1)=>{

               if(err1) throw err1
               var session = req.session

               session.userid = {id:result1[0].id};

               res.redirect("/dashboard");             

            })
        })

    } else{
        res.render("guestSignUp")
    }

});

app.get('/dashboard',(req,res) => {

        const sql = `SELECT * FROM form`;

        db.query(sql, (err,result)=>{

            if(err) throw err;

            console.log(result)

            res.render("dashboard",{data:result})

        })
});

app.get('/accept/:id',(req,res) => {

        const sql = `UPDATE form SET formStatus = "accepted" WHERE formID = ${req.params.id}`;

        db.query(sql, (err,result)=>{

            if(err) throw err;

            res.redirect("/dashboard")

        })
});

app.get('/decline/:id',(req,res) => {

        const sql = `UPDATE form SET formStatus = "declined" WHERE formID = ${req.params.id}`;

        db.query(sql, (err,result)=>{

            if(err) throw err;

            res.redirect("/dashboard")

        })
});

app.listen(process.env.PORT||3000);