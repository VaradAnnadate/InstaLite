const express = require('express');
const router = express.Router();
const postController = require('../controllers/posts.controller');
const likeController = require('../controllers/likes.controller');

router.post('/', postController.create);
router.get('/', postController.list);
router.get('/:id', postController.getOne);
router.patch('/:id', postController.update);
router.delete('/:id', postController.remove);

router.get('/:id/likes', likeController.getPostLikes);
router.post('/:id/likes', likeController.create);
router.delete('/:id/likes/:userId', likeController.remove);

module.exports = router;
