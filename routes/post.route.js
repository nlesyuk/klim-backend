const Router = require('express')
const router = new Router()
const PostController = require('../controllers/post.controller')

router.post('/post', PostController.createPost)
router.get('/post', PostController.getPostsByUser)
// router.get('/post/:id', PostController.getPost)
// router.put('/post/', PostController.updatePost)
// router.delete('/post/:id', PostController.deletePost)

module.exports = router