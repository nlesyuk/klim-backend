const express = require('express')
const userRoutes = require('./routes/user.route')
const PORT = process.env.PORT || 8080;

const app = express();

app.use('/api', userRoutes)


app.listen(PORT, () => console.log(`Server started in port ${PORT}`))