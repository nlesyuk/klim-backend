const Router = require('express')
const router = new Router()

// route images
router.get('/uploads/:user/:category/:file', (req, res) => {
  console.log('params', req.params)
  const author = req.headers.author
  const user = req.params.user
  const category = req.params.category
  const file = req.params.file
  // res.type('image/jpeg')
  res.sendFile(`/public/uploads/${user}/${category}/${file}`)
})

module.exports = router