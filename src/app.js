const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const multer  = require('multer'); // Uploaded file handling
const path = require('path');
const session = require("express-session");
const MongoStore = require("connect-mongo");
// const upload = multer({ dest: 'uploads/' }) ;
let {PythonShell} = require('python-shell')
require("dotenv").config();

// variables for future
let name = "";
let mail = "";
let imageName = "profileBackground.png";
let updatedImageName = null;
let passwordUpdated = "";


// variables storing Language property
let resultLang = "";
let appeared = "";
let description = "";
let langType = "";
let langcreators = "";
let langwebsite = "";
let langreference = "";
let langrank = "";
let langusers = "";
let langjobs = "";


// PYTHON SHELL INSTALL DEPENDENCIES
// let pyshell = new PythonShell('dependency.py');

//     pyshell.send("abc");

    
//     pyshell.on('message', function (message) {
//         // received a message sent from the Python script (a simple "print" statement)
//         console.log(message)
//     });

//       // end the input stream and allow the process to exit
//   pyshell.end(function (err,code,signal) {
//     if (err) throw err;
//     console.log('The exit code was: ' + code);
//     console.log('The exit signal was: ' + signal);
//     console.log('finished');
//   });


// Handling Uploads
var Storage = multer.diskStorage({
    destination: "../public/uploads",
    filename:(req,file,cb)=>{
        cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname ));
    }
})

var upload = multer({
    storage:Storage
}).single('file');  // here "file" is the same name provided in the name value of the form 


// Set up the mongodb and connect to the cluster

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { JsonWebTokenError } = require("jsonwebtoken");
const uri = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

let rasta = path.join(__dirname, "../views");


const app = express();


app.use(
    session({
      secret: "axbynehal", // Change this to a strong, unique secret
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: uri, // Your MongoDB Atlas connection string
        dbName: "Freeversity", // Choose a name for your session database
        collection: "signup", // Collection name for sessions
        autoRemove: 'interval', // Automatically remove expired sessions
        autoRemoveInterval: 10, // Interval in minutes (adjust according to your needs)
      }),
      cookie: { maxAge: 1000 }, // Session expires after 1 hour
    })
  );

// Example middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        console.log(req.session.user)
        return next();
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
};

  
console.log(isAuthenticated)

app.set('views', rasta);
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("../public"));

app.get("/", function(req, res){
    res.render('index');
});


// LOGIN MODULEMODULE

app.get("/login", function(req, res){
    res.render('login', {passwordUpdated:passwordUpdated});
});

app.post("/login", function(req, res){
    const data = req.body;
    console.log(data);

    const { MongoClient } = require("mongodb");

    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    
    // Reference the database to use
    const dbName = "Freeversity";

    async function run() {
        try {
            // Connect to the Atlas cluster
            await client.connect();
            const db = client.db(dbName);

            // Reference the "signup" collection in the specified database
            const col = db.collection("signup");

            // Check if the email already exists

            const user = await col.findOne({
                "Email": data.email,
                "Password": data.password
            });

            
            if (user) {
                // Email already exists, reject signup
                req.session.user = {
                    name: user.Fname,
                    mail: user.Email,
                    imageName: user.Image
                };

                console.log(mail+"if k ander")

                console.log("Login Successful");
                res.redirect("/userIndex");
                // res.render("userIndex", {name:name, mail:mail, imageName:imageName}); // You can render a rejection page or redirect as needed
            } 
            
            else {
                
                console.log("user name or password wrong");
                res.render("failLogin", {passwordUpdated:passwordUpdated});
            }
            console.log(mail+"if k bahar")
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
        console.log(mail+"try catch k bahar")
    }


    run().catch(console.dir);
});

console.log(mail+"sabse bahar")

app.get("/userIndex",isAuthenticated, function(req, res){
    const { name, mail, imageName } = req.session.user;
    res.render("userIndex", {name:name, mail:mail, imageName:imageName});
})



// Sign Up Module

app.get("/signup", function(req, res){
    res.render('signup');
});


app.post("/signup",upload, async function (req, res, next) {
    const data = req.body;
    console.log(data);

  

    const { MongoClient } = require("mongodb");

    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    // Reference the database to use
    const dbName = "Freeversity";

    async function run() {
        try {
            // Connect to the Atlas cluster
            await client.connect();
            const db = client.db(dbName);

            // Reference the "signup" collection in the specified database
            const col = db.collection("signup");

            // Check if the email already exists
            const existingUser = await col.findOne({ "Email": data.email });

            if (existingUser) {
                // Email already exists, reject signup
                console.log("User with this email already exists.");
                res.render("signupRejected"); // You can render a rejection page or redirect as needed
            } else {
                // Create a new document
                let personDocument = {
                    "Fname": data.firstName,
                    "Lname": data.lastName,
                    "Email": data.email,
                    "College": data.college,
                    "gradYear": data.gradYear,
                    "contactNumber": data.contactNumber,
                    "Password": data.password,
                    "Image": "profileBackground.png"
                };

                // Insert the document into the specified collection
                const result = await col.insertOne(personDocument);
                console.log("User registered successfully:", result.insertedId);
                res.render("loginSignupSuccessfull", {passwordUpdated:passwordUpdated});
            }
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    await run().catch(console.dir);
});


// Profile Picture

app.post('/upload', upload, isAuthenticated, function(req, res, next){
    var success = req.file.fieldname+ "Uplaoded Successfully";

    // name and email

    const { MongoClient } = require("mongodb");

    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    
    // Reference the database to use
    const dbName = "Freeversity";

    async function run() {
        try {
            // Connect to the Atlas cluster
            await client.connect();
            const db = client.db(dbName);

            // Reference the "signup" collection in the specified database
            const col = db.collection("signup");

            // Check if the email already exists

            const user = await col.findOne({
                "Email": mail,
                "Fname": name
            });

            
            if (user) {
                // Email already exists, reject signup
                imageName = req.file.filename; 
                let id = user._id;

                let filter = { _id: id };

                const update = {
                    $set: {
                      'Image': imageName
                    }
                  };
                const result = await col.updateOne(filter, update);
                
                imageName = await col.findOne({
                    "Email":mail,
                    "Fname":name
                })

                if(imageName){
                    updatedImageName = imageName.Image;
                    // You can render a rejection page or redirect as needed
                    res.render('userIndex', {name:name, mail:mail, imageName:updatedImageName});
                    updatedImageName=null;
                }

                
            } 
            
            else {
                
                console.log("Profile Not Updated");
            }
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
})




// Learning Path

app.get('/learningpath',isAuthenticated, function(req, res){
    const { name, mail, imageName } = req.session.user;
    res.render("LearningPath/personalizedLearningPath", {name:name, mail:mail, imageName:updatedImageName})
})

// Quiz section


// 1. Language Quiz
app.get('/quizLanguage',isAuthenticated, function(req, res){
    const { name, mail, imageName } = req.session.user;
    res.render("LearningPath/quizLanguage", {name:name, mail:mail, imageName:updatedImageName})
})

app.post('/quizLanguage', async function(req, res, next){
    quizData = req.body;
    quizDataArray = [quizData.projectType, quizData.skill, quizData.approach,  quizData.platformCompatibility, quizData.industry_trends, quizData.ecosystems_and_tools, quizData.scalibility, quizData.datahandling, quizData.documentation]
    // console.log(quizData)
    // console.log(quizDataArray)

    const { MongoClient } = require("mongodb");

    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    // Reference the database to use
    const dbName = "Freeversity";

    let pyshell = new PythonShell('app.py');

    pyshell.send(quizDataArray);

    
    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
        resultLang = message;


        // fetch data of lang from mongoDB
        async function run() {
            try {
                // Connect to the Atlas cluster
                await client.connect();
                const db = client.db(dbName);
    
                // Reference the "signup" collection in the specified database
                const col = db.collection("languages");
    
                // Check if the language name exists
                const lang = await col.findOne({
                    "title":resultLang
                });
    
                
                if (lang) {
                    // updating the property
                    appeared = lang.appeared;
                    langType = lang.type;
                    description = lang.description;
                    langcreators = lang.creators;
                    langwebsite = lang.website;
                    langreference = lang.reference;
                    langrank = lang.language_rank + 1;
                    langusers = lang.number_of_users;
                    langjobs = lang.number_of_jobs;
                    
    
                    console.log("Data Fetched");
    
                    res.redirect("/languageAns");
                    // res.render("userIndex", {name:name, mail:mail, imageName:imageName}); // You can render a rejection page or redirect as needed
                } 
                
                else {
                    
                    console.log("cant find data");
                    res.render("LearningPath/personalizedLearningPath", {name:name, mail:mail, imageName:updatedImageName})
                }
            } catch (err) {
                console.log(err.stack);
            } finally {
                await client.close();
            }
        }
    
        run().catch(console.dir);
    });

      // end the input stream and allow the process to exit
  pyshell.end(function (err,code,signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
  });
});


  
app.get("/languageAns", isAuthenticated,function(req, res){
    const { name, mail, imageName } = req.session.user;
    res.render("LearningPath/languageAns", {name:name, mail:mail, imageName:updatedImageName, resultLang:resultLang, appeared:appeared, description:description, langusers:langusers, langrank:langrank, langjobs:langjobs, langType:langType})
})


/*/////////////////////////////////////////
        Forgot Password
//////////////////////////////////////////*/

let matchPassword = "";

const jwt = require('jsonwebtoken');
const JWT_SECRET = "Some secret code";

app.get("/forgetPassword", function(req, res, next){
    res.render("ForgetPass/forgetPassword")
});

app.post("/forgetPassword", function(req, res, next){
    const forgotEmail = req.body.email;

    // validating if user exists
    const { MongoClient } = require("mongodb");

    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    // Reference the database to use
    const dbName = "Freeversity";

    async function run() {
        try {
            // Connect to the Atlas cluster
            await client.connect();
            const db = client.db(dbName);

            // Reference the "signup" collection in the specified database
            const col = db.collection("signup");

            // Check if the email already exists

            const user = await col.findOne({
                "Email": forgotEmail,
            });

            
            if (user) {  //if user exists we will generate OTP which is valid for 15 mins

                const secret = JWT_SECRET + user.Password;  //we are creating this so that user cannot use same otp for login even though 15 min is not Over.
                const payload = {
                    email:user.Email,
                    id:user._id
                }

                const token = jwt.sign(payload, secret, {expiresIn: '14m'});
                const link = `http://localhost:3000/resetPassword/${user._id}/${token}`
                const link2 = `https://nehal-3wi7.onrender.com/resetPassword/${user._id}/${token}`
                
                console.log("LINK SENT TO EMAIL")
                res.send("Link sent to EMAIL")
                console.log(link);

                // Mailing the link to the user 
                // Mailing the link to the user 
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Set to false for port 587
    auth: {
        user: "ctrlaltconquer@gmail.com",
        pass: "cefx sqlf lfwd omub"
    }
});

const mailOptions = {
    from: {
        name: "CtrlAltConquer Team",
        address: "ctrlaltconquer@gmail.com"
    },
    to: user.Email,
    subject: "Reset Password",
    text: "Hi, ILY this is your Password reset link \n for local server: "+link +"\n\n for online server: "+link2
};

const sendMail = async function (transporter, mailOptions) {
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.log(error);
    }
}

// Call the sendMail function with the transporter and mailOptions
sendMail(transporter, mailOptions);
            } 
            
            else {
                console.log("nhi bhai doesnot exist");
                res.send("Email does not exist")
            }
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
})


app.get("/resetPassword/:id/:token", function(req, res, next){
    const {id, token} = req.params;


    // verify if the same ID
    const { MongoClient } = require("mongodb");
    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    // Reference the database to use
    const dbName = "Freeversity";

    async function run() {
        try {
            // Connect to the Atlas cluster
            await client.connect();
            const db = client.db(dbName);

            // Reference the "signup" collection in the specified database
            const col = db.collection("signup");

            // Check if the email already exists

            const idExist = await col.findOne({
                "_id": new ObjectId(id),
            });

            // console.log(id);
            
            if (!idExist) {  //if user exists we will generate OTP which is valid for 15 mins
                res.send("INVALID ID")
                return
            } 
            const secret = JWT_SECRET + idExist.Password;

            try{

                const payload = jwt.verify(token, secret)
                res.render("ForgetPass/resetPassword", {email:idExist.Email, matchPassword:matchPassword})

            } catch(error){
                console.log(error.message)
                res.send(error.message)
            }


        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
});


app.post("/resetPassword/:id/:token", function(req, res, next){
    const {id, token} = req.params;

    const {password, password2} = req.body;

    // verify if the same ID
    const { MongoClient } = require("mongodb");
    // Replace the following with your Atlas connection string
    const url = "mongodb+srv://ctrlaltconquer:ctrlaltconquer@cluster0.xiam5xr.mongodb.net/?retryWrites=true&w=majority";
    const client = new MongoClient(url);

    // Reference the database to use
    const dbName = "Freeversity";

    async function run() {
        try {
            // Connect to the Atlas cluster
            await client.connect();
            const db = client.db(dbName);

            // Reference the "signup" collection in the specified database
            const col = db.collection("signup");

            // Check if the email already exists

            const idExist = await col.findOne({
                "_id": new ObjectId(id),
            });


            // console.log(id);
            
            if (!idExist) {  //if user exists we will generate OTP which is valid for 15 mins
                res.send("INVALID ID")
                return
            } 

            const secret = JWT_SECRET + idExist.Password;

            if (idExist){
                const oldPassword = idExist.Password;

                if(oldPassword == password){
                    matchPassword = "Cannot reset, previous password";
                    res.render("ForgetPass/resetPassword", {email:idExist.Email, matchPassword:matchPassword})
                    return
                }

            }

            try{

                const payload = jwt.verify(token, secret)
                
                // validate password and password 2

                let userid = idExist._id;

                let filter = { _id: userid };

                const update = {
                    $set: {
                      'Password': password
                    }
                  };
                const result = await col.updateOne(filter, update);

                passwordUpdated = "Password Updated Successfully";

                res.render("login", {passwordUpdated:passwordUpdated});


            } catch(error){
                console.log(error.message)
                res.send(error.message)
            }


        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);
    
});



// Running app on server 3000
app.listen(3000, function(){
    console.log("Server started running on port 3000");
});
