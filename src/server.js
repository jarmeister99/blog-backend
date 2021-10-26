// load environment variables from file
require('dotenv').config();

// --- external libraries ---
const express = require('express'); // routing & request / responses
const express_session = require('express-session')
const cors = require('cors'); // cross origin resource sharing (express <-> react)
const mongoose = require('mongoose'); // mongodb wrapper
const passport = require('passport')

// --- internal libraries ---
const { getAllPosts, addPost, deletePost } = require('./post_api');
const { addUser, userData, authenticationStrategy } = require('./user_api');
authenticationStrategy(); // call authentication strategy to prepare passport

// --- server objects ---
const app = express(); // create express instance
const port = process.env.PORT || 5000; // set port to env variable or default

// --- middleware ---
app.use(express.json()); // response body -> json
app.use(cors({ credentials: true, origin: true })); // cross origin resource sharing
app.use(express_session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));  // dummy secret key for now
app.use(express.urlencoded({
    extended: true
}));
app.use(passport.initialize()); // user authentication
app.use(passport.session());

// database connection
mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zs7po.mongodb.net/blogdb?retryWrites=true&w=majority`
).then(() => console.log('Successfully connected to Mongo Atlas')
).catch(e => console.log(e));


// --- routes ---
app.get('/api/foobar', (req, res) => res.send('Hello world!!').end());

// posts
app.get('/api/posts', getAllPosts);
app.post('/api/posts', addPost);
app.delete('/api/posts', deletePost);

// users
app.get('/api/users/user_data', userData)
app.post('/api/users/register', addUser);
app.get('/api/users/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
app.post('/api/users/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err); // will generate a 500 error
        }
        // Generate a JSON response reflecting authentication status
        if (!user) {
            return res.send(401).end();
        }
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.send({ user }).end();
        });
    })(req, res, next);
});

app.listen(port, () => console.log(`Listening on port ${port}`))