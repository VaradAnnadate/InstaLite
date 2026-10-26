const prisma = require('../db');

async function createUser(data) {
    const { username, email, fullname, bio } = data;
    return await prisma.user.create({
        data: {
            username,
            email,
            fullname,
            bio
        }
    });
}

async function listUsers(page, limit, sortBy, order, isPrivate, search, hasPosts) {
    const skip = (page - 1) * limit;

    const where = {};
    if (isPrivate !== undefined) {
        where.isPrivate = isPrivate;
    }
    if (search) {
        where.OR = [
            { username: { contains: search, mode: 'insensitive' } },
            { fullname: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (hasPosts !== undefined) {
        if (hasPosts) {
            where.posts = { some: {} };
        } else {
            where.posts = { none: {} };
        }
    }

    const orderBy = {};
    orderBy[sortBy] = order;

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy
        }),
        prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data: users,
        meta: {
            page,
            limit,
            total,
            totalPages
        }
    };
}

async function getUserById(id) {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    posts: true,
                    likes: true
                }
            }
        }
    });
}

async function updateUser(id, data) {
    const { fullname, bio, isPrivate } = data;
    return await prisma.user.update({
        where: { id },
        data: {
            fullname,
            bio,
            isPrivate
        }
    });
}

async function deleteUser(id) {
    return await prisma.user.delete({
        where: { id }
    });
}

async function getUserPosts(userId, page, limit) {
    const skip = (page - 1) * limit;

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where: { authorId: userId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        }),
        prisma.post.count({ where: { authorId: userId } })
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

async function getUserLikedPosts(userId, page, limit) {
    const skip = (page - 1) * limit;

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
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
        prisma.post.count({
            where: {
                likes: {
                    some: {
                        userId
                    }
                }
            }
        })
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

module.exports = {
    createUser,
    listUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserPosts,
    getUserLikedPosts
};
