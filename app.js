const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const bodyParser = require("body-parser");
const User = require('./models/User');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStorage = require('node-localstorage').LocalStorage;
var userProfile, token

const port = process.env.port || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET'
}));

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(port, () => console.log(`Im on it! ${port}`));

// Passport

app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => { res.render('success', {user: userProfile})});
app.get('/error', (req, res) => {res.send("Something went wrong!")});

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
    scope : ['profile','email']
}

passport.use(new GoogleStrategy(authConfig,
    async (accessToken, refreshToken, profile, done) => {
        // console.log(profile);
        let newUser = {
            displayName: profile.displayName,
            email: profile.emails[0].value
        }
        localStorage = new LocalStorage('./tokens');
        localStorage.setItem('access-token', accessToken);
        let user = await User.findOne({ displayName: profile.displayName });
        // check if user is available in the database
        // console.log(`if ${user}`)
        if(user){
            // if user is available
            userProfile = profile
            return done(null, userProfile)
        } else {
            // if user is not available create an entry
            user = await User.create(newUser)
            userProfile = profile
            return done(null, userProfile)
        }
    }
));


app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: '/error',
    successRedirect: '/success'
}));