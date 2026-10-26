const userService = require('../services/users.service');

async function create(req, res) {
    const { username, email, fullname, bio } = req.body;

    if (!username || !email || !fullname) {
        return res.status(400).json({ error: "username, email and fullname are required" });
    }

    try {
        const user = await userService.createUser({ username, email, fullname, bio });
        res.status(201).json(user);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: "username or email already taken" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
}

async function list(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order || 'desc';
    const isPrivate = req.query.isPrivate;
    const search = req.query.search;
    const hasPosts = req.query.hasPosts;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({ error: "page and limit must be positive integers" });
    }

    const allowedSortBy = ['createdAt', 'username', 'fullname'];
    if (!allowedSortBy.includes(sortBy)) {
        return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
    }

    if (order !== 'asc' && order !== 'desc') {
        return res.status(400).json({ error: "order must be asc or desc" });
    }

    if (isPrivate !== undefined && isPrivate !== 'true' && isPrivate !== 'false') {
        return res.status(400).json({ error: "isPrivate must be true or false" });
    }

    if (hasPosts !== undefined && hasPosts !== 'true' && hasPosts !== 'false') {
        return res.status(400).json({ error: "hasPosts must be true or false" });
    }

    const isPrivateBool = isPrivate === 'true' ? true : isPrivate === 'false' ? false : undefined;
    const hasPostsBool = hasPosts === 'true' ? true : hasPosts === 'false' ? false : undefined;

    const finalLimit = limit > 50 ? 50 : limit;

    const result = await userService.listUsers(page, finalLimit, sortBy, order, isPrivateBool, search, hasPostsBool);
    res.json(result);
}

async function getOne(req, res) {
    const id = parseInt(req.params.id);
    const user = await userService.getUserById(id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
}

async function update(req, res) {
    const id = parseInt(req.params.id);
    const { fullname, bio, isPrivate } = req.body;

    const user = await userService.getUserById(id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await userService.updateUser(id, { fullname, bio, isPrivate });
    res.json(updatedUser);
}

async function remove(req, res) {
    const id = parseInt(req.params.id);

    const user = await userService.getUserById(id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    await userService.deleteUser(id);
    res.status(204).send();
}

async function getPosts(req, res) {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({ error: "page and limit must be positive integers" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const finalLimit = limit > 50 ? 50 : limit;
    const result = await userService.getUserPosts(userId, page, finalLimit);
    res.json(result);
}

async function getLikedPosts(req, res) {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({ error: "page and limit must be positive integers" });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const finalLimit = limit > 50 ? 50 : limit;
    const result = await userService.getUserLikedPosts(userId, page, finalLimit);
    res.json(result);
}

module.exports = {
    create,
    list,
    getOne,
    update,
    remove,
    getPosts,
    getLikedPosts
};
