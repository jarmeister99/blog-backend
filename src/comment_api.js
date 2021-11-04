const mongoose = require('mongoose')

// database objects
const CommentSchema = new mongoose.Schema({
    content: String,
    user: String,
    post: { type: mongoose.ObjectId, ref: 'Post' },
    createdOn: { type: Date, default: Date.now() }
});
const Comment = mongoose.model('Comment', CommentSchema);

const getComments = (req, res) => {
    Comment.find({ post: req.query.postId }).sort({ createdOn: 'asc' }).then(result => {
        res.send(result).end();
    }).catch(e => {
        res.status(500).send(e).end();
    })
}
const deleteComment = (req, res) => {
    if (!req.isAuthenticated()) {
        res.status(401).end();
    }
    else {
        Comment.deleteOne({ "_id": req.body._id, "user": req.user.username }).then((result) => {
            res.send(result).status(200).end();
        }).catch(error => {
            res.send(result).status(404).end();
            console.log(error)
        })
    }
}

const addComment = (req, res) => {
    const body = req.body;
    const date = Date.now();
    if (!req.isAuthenticated()) {
        res.status(401).end();
    }
    else if (body.content === undefined || body.content === '') { // prevent empty comments
        res.status(400).end();
    }
    else if (body.postId === undefined || body.postId === '') { // prevent homeless comments
        res.status(400).end(); 
    }
    else {
        const comment = new Comment({
            content: body.content,
            user: req.user.username,
            post: body.postId,
            createdOn: date
        });
        comment.save().then(
            res.status(200).json(comment).end()
        ).catch(e => {
            res.status(400).send(e).end()
        })
    }
}

module.exports = {
    getComments, addComment, deleteComment
}