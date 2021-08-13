const express = require('express')
const userRoutes = require('./routes/user.route')
const postRoutes = require('./routes/post.route')
const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.json()) // for parsing json
app.use('/api', userRoutes)
app.use('/api', postRoutes)


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))