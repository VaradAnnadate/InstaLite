const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');

router.post('/', userController.create);
router.get('/', userController.list);
router.get('/:id', userController.getOne);
router.patch('/:id', userController.update);
router.delete('/:id', userController.remove);

router.get('/:id/posts', userController.getPosts);
router.get('/:id/liked-posts', userController.getLikedPosts);

module.exports = router;
