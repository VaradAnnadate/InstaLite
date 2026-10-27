const prisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

async function seed() {
  try {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createManyAndReturn({
      data: users
    });

    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.username] = user.id;
    });

    const postsWithAuthorId = posts.map(post => ({
      imageUrl: post.imageUrl,
      caption: post.caption,
      location: post.location,
      createdAt: post.createdAt,
      authorId: userMap[post.author]
    }));

    const createdPosts = await prisma.post.createManyAndReturn({
      data: postsWithAuthorId
    });

    const postMap = {};
    createdPosts.forEach(post => {
      const match = post.imageUrl.match(/seed\/(insta\d+)\//);
      const key = match ? match[1] : null;
      if (key) {
        postMap[key] = post.id;
      }
    });

    const likesWithIds = likes.map(like => ({
      userId: userMap[like.user],
      postId: postMap[like.post]
    }));

    const createdLikes = await prisma.like.createMany({
      data: likesWithIds
    });

    console.log(`🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
