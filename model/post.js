const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PostsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const Posts = mongoose.model("Posts", PostsSchema);
module.exports = Posts;