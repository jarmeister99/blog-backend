const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local') // login strategy for passport

const SALT_WORK_FACTOR = 10;

// database objects
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const authenticationStrategy = function(){
    // authentication strategy
    passport.use(new LocalStrategy((username, password, cb) => {
        User.findOne({"username": username}, (err, user) => {
            if (err){
                return cb(err);
            }
            else if (user){
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err){
                        console.log(err);
                        return cb(err);
                    }
                    else if (result){
                        return cb(null, user);
                    }
                    else{
                        return cb(null, false);
                    }
                })
            }
            else{
                return cb(null, false)
            }
        })
    }))
}
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, {id: user._id});
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        User.findById(user.id, function(err, user) {
            cb(err, user);
        })
    });
});

const userData = (req, res) => {
    if (req.isAuthenticated()){
        res.json(req.user).end();
    }
    else{
        res.json({}).end();
    }
}

const addUser = (req, res) => {
    bcrypt.genSalt(SALT_WORK_FACTOR).then(salt => (
        bcrypt.hash(req.body.password, salt)
    )).then(hashed_pass => {
        const user = new User({ username: req.body.username, password: hashed_pass});
        user.save().then(() => {
            res.status(200).json(user).end();
        }).catch(e => {
            if (e.code === 11000){
                console.log(`Cannot create duplicate user ${e.keyValue.username}`)
            }
            res.status(400).send(e).end();
        })
    }).catch(e => {
        console.log(e);
    })
}

module.exports = {
    addUser, userData, authenticationStrategy
}
