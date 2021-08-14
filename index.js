const express = require('express')
const app = express();
const PORT = process.env.PORT || 8080;


const workRoutes = require('./routes/work.route')
const contactRoutes = require('./routes/contact.route')



app.use(express.json()) // for parsing json
app.use('/api', workRoutes)
app.use('/api', contactRoutes)



app.listen(PORT, () => console.log(`Server started on port ${PORT}`))