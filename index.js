import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import 'dotenv/config'
import users from "./models/users_schema.js"
import { login, signUp } from "./controllers/authcontrol.js";
import furnitur from './models/furniture_Schema.js'
//import authRouter from './routes/authroute.js';
import mongoose from "mongoose"
import cors from "cors"
import bodyParser from 'body-parser';
import jwt from "jsonwebtoken";
const url = process.env.Mongo_url;
const app = express()



mongoose.connect(url).then(() => {
    console.log('connected')

}).catch(err => {
    console.error('error')
})
app.use(express.json())
app.use(cors())

app.post('/addfur', bodyParser.urlencoded({ extended: true }), (req, res) => {


    console.log(req.body);

    let fur = new furnitur({
        type: req.body.type,
        description: req.body.description,
        image_url: req.body.image_url,
        price: req.body.price
    })
    fur.save();
    res.send("success")
})
app.post("/login", bodyParser.urlencoded({ extended: true }), login);
app.post("/contact", bodyParser.urlencoded({ extended: true }), signUp);
/*app.post('/contact', bodyParser.urlencoded({ extended: true }), (req, res) => {


    console.log(req.body);

    let person = new users({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: req.body.Password,
        Phone_Number: req.body.Phone_Number,
        Massage: req.body.Massage

    })
    person.save()
    res.send("success")
})*/
/*app.post('/login', bodyParser.urlencoded({ extended: true }), (req, res) => {
    async function person_verif(name_user) {
        try {

            const user = await users.find({ Name: name_user });
            console.log(user)
            console.log(user.Password)

            if (user.Password === req.body.Password) {
                console.log("verified user")

            }
        }
        catch (err) {
            console.error(err);
        }
    }
    person_verif(req.body.Name);


})*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend/build')));

let data = [];
/*app.get('*', (req, res) => {
    const filePath = path.join(__dirname, '../frontend/build', 'index.html');
    res.sendFile(filePath);

})*/
const verifytoken = (req, res, next) => {
    let token = req.headers.authorization
    if (!token) {
        res.status(400).json("rejected")
    }
    try {

        jwt.verify(token, process.env.TOKEN_KEY,)
        next()
    }
    catch (err) {
        res.status(400).json(err)
    }



}

app.get('/f', verifytoken, (req, res) => {
    furnitur.find().then(doc => {
        console.log(doc)
        //data = doc
        res.json(doc)




    })
        .catch(err => {
            console.error(err)
        })

})
let result = [];
app.get('/search/:term', async (req, res) => {
    try {
        const searchTerm = req.params.term;
        console.log(searchTerm)

        const filteredItems = await furnitur.find({ type: { $regex: searchTerm, $options: 'i' } });
        console.log(filteredItems)
        result = filteredItems;



    } catch (error) {
        console.error(error)
    }
});
app.get('/searchresult', async (req, res) => {
    try {
        res.send(result);
    }
    catch (error) {
        console.error(error)
    }
})
app.get('/fur', (req, res) => {
    furnitur.find().then(doc => {
        /*console.log(doc)*/
        res.send(doc)
    })

})
app.get('/allusers', (req, res) => {
    users.find().then(doc => {
        console.log(doc)
        res.send(doc)
    })

})
app.put('/create/:name', bodyParser.urlencoded({ extended: true }), (req, res) => {
    console.log(req.params.name)
    users.findOneAndUpdate({ Name: req.params.name }, { Password: req.body.newpassword }, { new: true }).then(doc => {
        res.send(doc)
        console.log(doc)


    })


})





const port = process.env.PORT || 5000;
app.listen(port, () => console.log("server connected"))
