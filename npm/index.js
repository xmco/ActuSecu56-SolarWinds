var express = require("express");
var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var saml = require('passport-saml');
var fs = require('fs');
const ntp = require('ntp2');


var app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(session({secret: 'secretsessionusedfortheGoldenSAMLpoc', 
                 resave: false, 
                 saveUninitialized: true,}));

app.get('/',
    function(req, res) {
        res.send('Welcome to the Service Provider Home Page');
    }
);

passport.serializeUser(function(user, done) {
    console.log('-----------------------------');
    console.log('serialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});passport.deserializeUser(function(user, done) {
    console.log('-----------------------------');
    console.log('deserialize user');
    console.log(user);
    console.log('-----------------------------');
    done(null, user);
});

var samlStrategy = new saml.Strategy({
    callbackUrl: 'http://sp:4300/login/callback',
    entryPoint: 'http://idp/simplesaml/saml2/idp/SSOService.php',
    issuer: 'test-sp',
    identifierFormat: null,
    cert: fs.readFileSync(__dirname + '/certs/idp_server.crt', 'utf8'),
    validateInResponseTo: false,
    disableRequestedAuthnContext: true
}, function(profile, done) {
    return done(null, profile);
});

passport.use('samlStrategy', samlStrategy);
app.use(passport.initialize({}));
app.use(passport.session({}));


app.get('/login',
    function (req, res, next) {
        console.log('-----------------------------');
        console.log('/Start login handler');
        next();
    },
    passport.authenticate('samlStrategy'),
);

app.post('/login/callback',
    function (req, res, next) {
        console.log('-----------------------------');
        console.log('/Start login callback ');
        next();
    },
    passport.authenticate('samlStrategy'),
    function (req, res) {
        console.log('-----------------------------');
        console.log('login call back dumps');
        console.log("utilisateur:"+req.user);
        console.log('-----------------------------');
        res.send('Log in Callback Success, as '+JSON.stringify(req.user, null, 4));
    }
);

app.get('/metadata',
    function(req, res) {
        res.type('application/xml');
        res.status(200).send(
          samlStrategy.generateServiceProviderMetadata(
             fs.readFileSync(__dirname + '/certs/cert.pem', 'utf8'),
             fs.readFileSync(__dirname + '/certs/cert.pem', 'utf8')
          )
        );
    }
);

var server = app.listen(4300, function () {
    console.log('Listening on port %d', server.address().port)
});
