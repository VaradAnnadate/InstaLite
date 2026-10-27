const likeService = require('../services/likes.service');
const postService = require('../services/posts.service');
const userService = require('../services/users.service');

async function create(req, res) {
    const postId = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    const post = await postService.getPostById(postId);
    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    try {
        const like = await likeService.createLike(postId, userId);
        res.status(201).json(like);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "Already liked" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

async function remove(req, res) {
    const postId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    try {
        await likeService.deleteLike(postId, userId);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Like not found" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

async function getPostLikes(req, res) {
    const postId = parseInt(req.params.id);

    const post = await postService.getPostById(postId);
    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    const users = await likeService.getPostLikes(postId);
    res.json(users);
}

module.exports = {
    create,
    remove,
    getPostLikes
};
