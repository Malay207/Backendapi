const express = require("express");
const fetchuser = require("../middleware");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Post = require("../model/post");
const Like = require("../model/Like");
//create....
router.post("/createposts", fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('content', 'Enter a valid content').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const post = new Post({
            title,
            content,
            image,
            user: req.user.id,
        })
        const savedPost = await post.save();
        res.json(savedPost);
    } catch (error) {
        res.status(500).send("Some error occured");
    }
});
//read....
router.get("/showposts", fetchuser, async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).send("Some error occured");
    }
});
//update...
router.put('/update/:id', fetchuser, [
    body('title', 'Enter a valid title')
        .isLength({ min: 3 }),
    body('content', 'Enter a valid content')
        .isLength({ min: 5 }),
    body('image', 'Enter a valid image')
        .isLength({ min: 5 }),
], async (req, res) => {
    try {
        let id = req.params.id;
        const { title, content, image } = req.body;
        const newNote = {};
        if (title) { newNote.title = title };
        if (content) { newNote.content = content };
        if (image) { newNote.image = image };
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).send("Not Found");
        }
        if ((post.user.toString() !== req.user.id)) {
            return res.status(401).send({ error: "You are not allowed to change the content here. Go to Your Post", success: false });
        }
        post = await Post.findByIdAndUpdate(id, { $set: newNote }, { new: true });
        res.json({ post, success: true });
    } catch (error) {
        res.status(500).send("Some error occured");
    }
}
);
//delete...
router.delete('/delete/:id', fetchuser, async (req, res) => {
    try {
        let id = req.params.id;
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).send("Not Found");
        }
        if ((post.user.toString() !== req.user.id)) {
            return res.status(401).json({ error: "You are not able to delete other's Post.", sucess: false });
        }
        post = await Post.findByIdAndDelete(id);
        res.json({ sucess: true, msg: "Post has been deleted" });
    } catch (error) {
        res.status(500).send("Some error occured");
    }
});
//like...
router.put('/like/:id', fetchuser, async (req, res) => {
    try {
        let id = req.params.id;
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).send("Not Found");
        }
        let like = await Like.findOne({ post: id, user: req.user.id });
        if (like) {
            like = await Like.findOneAndUpdate({ post: id, user: req.user.id }, { $set: { like: true } }, { new: true });
        }
        else {
            like = new Like({
                user: req.user.id,
                post: id,
                like: true,
            });
            await like.save();
        }

        res.json({ success: true, like: like });
    } catch (error) {
        res.status(500).send("Some error occured");
    }
});
//comment...
router.post('/comment/:id', fetchuser, async (req, res) => {
    try {
        const { comment } = req.body;
        let id = req.params.id;
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).send("Not Found");
        }
        let like = await Like.findOne({ post: id, user: req.user.id });
        if (!like) {
            like = new Like({
                user: req.user.id,
                post: id,
                Comment: comment,

            });
            await like.save();
        }
        const newNote = {};
        if (comment) { newNote.Comment = comment };
        like = await Like.findOneAndUpdate({ post: id, user: req.user.id }, { $set: newNote }, { new: true });
        res.json({ success: true, like: like });
    } catch (error) {
        res.status(500).send("Some error occured");
    }
});
module.exports = router;


