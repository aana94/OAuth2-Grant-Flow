const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
var userProfile

const port = process.env.port || 3000;

app.set('view engine', 'ejs');

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
}));

app.get('/', (req, res) => {
    // res.send('Hello Ohhoo!')
    console.log('to the pages');
    res.render('index')
})

app.listen(port, () => console.log(`Im on it! ${port}`));

// Passport

app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => { res.render('success', {user: userProfile})});
app.get('/error', (req, res) => res.send("Something went wrong!"));

passport.serializeUser((user, cb) => {
cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

const authConfig = {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI,
}

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy(authConfig,
    function(accessToken, refreshToken, profile, done) {
        console.log('in google strategy');
        userProfile = profile
        console.log('user detail', accessToken)
        return done(null, userProfile)
    }
));

// 'https://www.googleapis.com/auth/plus.login'

app.get('/auth/google', passport.authenticate('google', { scope : ['profile','email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: '/error',
    successRedirect: '/success'
}));