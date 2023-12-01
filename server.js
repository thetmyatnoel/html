var fs = require('fs');
var path = require('path');
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cors = require('cors');
const nodemailer = require('nodemailer');

var app = express();
app.use(cors());

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

// Database connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your database username
    password: 'NewPass1@!', // replace with your database password
    database: 'fastpace' // replace with your database name
});

connection.connect(function(error) {
    if (error) {
        console.error('Error connecting to the database: ', error);
        return;
    }
    console.log("Connected to Database!");
});

let transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email provider
    auth: {
        user: 'senderinquiry@gmail.com', // Replace with your email address
        pass: 'jwwd djdm gyxj hlnx'     // Replace with your email password
    }
});

app.post('/submit-inquiry', cors(), function(request, response){
    var formData = {
        category: request.body.category,
        companyName: request.body.companyName,
        name: request.body.name,
        contact: request.body.contact,
        email: request.body.email,
        inquiry: request.body.inquiry
    };

    // Database operation Promise
    const dbPromise = new Promise((resolve, reject) => {
        connection.query('INSERT INTO inquiries SET ?', formData, function(error, results, fields) {
            if (error) {
                console.error('Error occurred during database operation: ', error);
                reject('Error occurred during database operation');
            } else {
                resolve('Inquiry Submitted Successfully to Database');
            }
        });
    });

    // Email sending Promise
    const emailPromise = new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'senderinquiry@gmail.com',
            to: 'thetmyatnoe884@icloud.com',
            subject: 'New Inquiry Submission',
            text: `Category: ${formData.category}\nCompany Name: ${formData.companyName}\nName: ${formData.name}\nContact: ${formData.contact}\nEmail: ${formData.email}\nInquiry: ${formData.inquiry}`
        };

        transporter.sendMail(mailOptions, (emailError, info) => {
            if (emailError) {
                console.error('Error sending email: ', emailError);
                reject('Error occurred during email sending');
            } else {
                resolve('Email Sent Successfully');
            }
        });
    });

    // Execute both promises concurrently
    Promise.all([dbPromise, emailPromise])
        .then(results => {
            response.json({ success: true, message: results.join('. ') });
        })
        .catch(error => {
            response.status(500).send(error);
        });
});
// Start server
var serverPort = 10022;
app.listen(serverPort, function() {
    console.log('Server running on port ' + serverPort);
});
