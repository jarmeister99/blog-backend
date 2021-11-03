const mongoose = require('mongoose')

// database objects
const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    user: String,
    createdOn: { type: Date, default: Date.now() }
});
const Post = mongoose.model('Post', PostSchema);

const getAllPosts = (req, res) => {
    Post.find({}).sort({ createdOn: 'desc' }).then(result => {
        res.send(result).end();
    }).catch(e => {
        res.status(500).send(e).end();
    })
}
const deletePost = (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(401).end();
    }
    else {
        Post.deleteOne({ "_id": req.body._id, "user": req.user.username }).then((result) => {
            res.send(result).status(200).end();
        }).catch(error => {
            res.send(result).status(404).end();
            console.log(error)
        })
    }
}

const editPost = (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(401).end();
    }
    else {
        Post.findByIdAndUpdate(req.body.data._id, {title: req.body.data.title, content: req.body.data.content}).then(resp => {
            res.status(200).end();
        }).catch(e => {
            res.status(400).send(e).end();
        })
    }
}

const addPost = (req, res) => {
    const body = req.body;
    const date = Date.now();
    if (!req.isAuthenticated()) {
        res.status(401).end();
    }
    else if (body.title === undefined || body.title === '') { // title is only required field
        res.status(400).end();
    }
    else {
        const post = new Post({
            title: body.title,
            content: body.content,
            user: req.user.username,
            createdOn: date
        });
        post.save().then(
            res.status(200).json(post).end()
        ).catch(e => {
            res.status(400).send(e).end()
        })
    }
}

module.exports = {
    getAllPosts, addPost, deletePost, editPost
}