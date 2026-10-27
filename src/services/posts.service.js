const prisma = require('../db');

async function createPost(data) {
    const { imageUrl, caption, location, authorId } = data;
    return await prisma.post.create({
        data: {
            imageUrl,
            caption,
            location,
            authorId
        }
    });
}

async function listPosts(page, limit, sortBy, order, location, search, from, to) {
    const skip = (page - 1) * limit;

    const where = {};
    if (location) {
        where.location = { contains: location, mode: 'insensitive' };
    }
    if (search) {
        where.caption = { contains: search, mode: 'insensitive' };
    }
    if (from || to) {
        where.createdAt = {};
        if (from) {
            where.createdAt.gte = new Date(from);
        }
        if (to) {
            where.createdAt.lte = new Date(to);
        }
    }

    let orderBy;
    if (sortBy === 'likes') {
        orderBy = [{ likes: { _count: order } }, { createdAt: 'desc' }];
    } else {
        orderBy = { [sortBy]: order };
    }

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true
                    }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        }),
        prisma.post.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: posts,
        meta: {
            page,
            limit,
            total,
            totalPages
        }
    };
}

async function getPostById(id) {
    return await prisma.post.findUnique({
        where: { id },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    fullname: true
                }
            },
            _count: {
                select: {
                    likes: true
                }
            }
        }
    });
}

async function updatePost(id, data) {
    const { caption, location } = data;
    return await prisma.post.update({
        where: { id },
        data: {
            caption,
            location
        }
    });
}

async function deletePost(id) {
    return await prisma.post.delete({
        where: { id }
    });
}

module.exports = {
    createPost,
    listPosts,
    getPostById,
    updatePost,
    deletePost
};
