require('dotenv').config()
require('./bot')

const path = require('path')
const express = require('express')
const app = express()
const port = process.env.PORT || 3333

const PUBLIC_DIR = path.resolve(__dirname, '../client/public')

app.use(express.static(PUBLIC_DIR))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(PUBLIC_DIR, 'index.html'));
})

app.listen(port, () => {
  console.log(`[client-app] listening: http://localhost:${port}`)
})

process.on('exit', () => process.exit())