var http = require('http');
var port = process.env.PORT || 8080;

const { parse } = require('querystring');

var app = http.createServer(function (req, res) {

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.statusCode = 200;

    console.log(req.url);
    console.log(req.headers);

    if (req.url == '/') {

        var POST = '';

        if (req.method == 'POST') {
            req.on('data', function (data) {
                POST += data;
            })

            req.on('end', function () {
                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);

                POST = parse(POST.toString());

                const msg = {
                    to: process.env.SEND_TO_EMAIL,
                    cc: POST.email,
                    from: process.env.SEND_FROM_EMAIL,
                    subject: 'New Message From Contact Form',
                    text: POST.message
                };

                console.log(msg);

                var validator = require("email-validator");

                if (validator.validate(msg.cc)) {

                    if (msg.text.trim() == '') {
                        console.log('Empty message field.');
                        res.end('Error Occured! Empty Message Field.');
                    }
                    else {
                        sgMail.send(msg, function (err, response) {
                            if (err) {
                                console.log('Error: ' + err);
                                res.end('Error Occured! Contact Support.');
                            }
                            else {
                                console.log('Email Sent!');
                                res.end('Form data has been processed and emailed! Check your email for a copy of email sent. If you have not received this then let me know via another contact option.');
                            }
                        });
                    }
                } else {
                    console.log('Email address failed validation test.');
                    res.end('Error Occured! Invalid Email Address.');
                }
            });

            req.on('error', function (err) {
                console.log('Error: ' + err);
                res.end('Error Occured! Contact Support.');
            });
        }
    }
});

app.listen(port);