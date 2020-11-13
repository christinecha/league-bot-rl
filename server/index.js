require('dotenv').config()
require('./bot')

const path = require('path')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.use(express.static('../client/public'))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public/index.html'));
})

app.listen(port, () => {
  console.log(`[client-app] listening: http://localhost:${port}`)
})
