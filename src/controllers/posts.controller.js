const postService = require('../services/posts.service');
const userService = require('../services/users.service');

async function create(req, res) {
    const { imageUrl, caption, location, authorId } = req.body;

    if (!imageUrl || !authorId) {
        return res.status(400).json({ error: "imageUrl and authorId are required" });
    }

    const user = await userService.getUserById(authorId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const post = await postService.createPost({ imageUrl, caption, location, authorId });
    res.status(201).json(post);
}

async function list(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order || 'desc';
    const location = req.query.location;
    const search = req.query.search;
    const from = req.query.from;
    const to = req.query.to;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({ error: "page and limit must be positive integers" });
    }

    const allowedSortBy = ['createdAt', 'updatedAt', 'likes'];
    if (!allowedSortBy.includes(sortBy)) {
        return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
    }

    if (order !== 'asc' && order !== 'desc') {
        return res.status(400).json({ error: "order must be asc or desc" });
    }

    if (from || to) {
        if (from && isNaN(Date.parse(from))) {
            return res.status(400).json({ error: "from and to must be valid dates" });
        }
        if (to && isNaN(Date.parse(to))) {
            return res.status(400).json({ error: "from and to must be valid dates" });
        }
    }

    const finalLimit = limit > 50 ? 50 : limit;

    const result = await postService.listPosts(page, finalLimit, sortBy, order, location, search, from, to);
    res.json(result);
}

async function getOne(req, res) {
    const id = parseInt(req.params.id);
    const post = await postService.getPostById(id);
    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
}

async function update(req, res) {
    const id = parseInt(req.params.id);
    const { caption, location } = req.body;

    const post = await postService.getPostById(id);
    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = await postService.updatePost(id, { caption, location });
    res.json(updatedPost);
}

async function remove(req, res) {
    const id = parseInt(req.params.id);

    const post = await postService.getPostById(id);
    if (!post) {
        return res.status(404).json({ error: "Post not found" });
    }

    await postService.deletePost(id);
    res.status(204).send();
}

module.exports = {
    create,
    list,
    getOne,
    update,
    remove
};
