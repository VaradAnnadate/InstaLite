const prisma = require('../db');

async function createLike(postId, userId) {
    return await prisma.like.create({
        data: {
            postId,
            userId
        }
    });
}

async function deleteLike(postId, userId) {
    return await prisma.like.delete({
        where: {
            userId_postId: {
                userId,
                postId
            }
        }
    });
}

async function getPostLikes(postId) {
    const likes = await prisma.like.findMany({
        where: { postId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    fullname: true
                }
            }
        },
        orderBy: {
            user: {
                username: 'asc'
            }
        }
    });

    return likes.map(like => like.user);
}

module.exports = {
    createLike,
    deleteLike,
    getPostLikes
};
