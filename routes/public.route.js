const Router = require('express')
const router = new Router()
const path = require('path')

// route images
router.get('/uploads/:user/:category/:file', (req, res) => {
  console.log('params', req.params)
  const author = req.headers.author
  const user = req.params.user
  const category = req.params.category
  const file = req.params.file
  res.sendFile(path.join(__dirname, `../public/uploads/${user}/${category}/${file}`))
})

module.exports = router