const express = require('express');
const app = express();
const cors = require('cors')
const userRoutes = require('./routes/userRoute');
const config = require('./config/config');
const nodemailer = require('nodemailer')


const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/intersalaAssignment')

app.use('/api', userRoutes);


console.log("Hello Satya");
app.use(cors());

app.get('*', function (req, res, next) {
    var err = new Error('Page Not Found');
    next(err)
})

app.use(function (err, req, res, next) {
    res.status(500).send({ message: err })
})

app.listen(8080, () => console.log("Server is listening on port 3000."));