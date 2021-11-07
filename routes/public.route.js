const Router = require('express')
const router = new Router()
const path = require('path')
const {
  getCurrentDateTime
} = require('../global/helper')


// route images
router.get('/uploads/:user/:category/:file', (req, res) => {
  const d = getCurrentDateTime()
  console.log('------------------------------------public-START', d)

  console.log('params', req.params)
  const author = req.headers.author
  const user = req.params.user // interceptors auto inject user on the frontend
  const category = req.params.category
  const file = req.params.file
  res.sendFile(path.join(__dirname, `../public/uploads/${user}/${category}/${file}`))

  console.log('------------------------------------public-END', d)
})

module.exports = router