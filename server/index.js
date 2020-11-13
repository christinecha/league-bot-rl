require('dotenv').config()
require('./bot')

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const matches = require('./data/matches')
const { discord } = require('./data/util/discord')
const app = express()
const port = process.env.PORT || 3333

const PUBLIC_DIR = path.resolve(__dirname, '../client/public')

app.use(express.static(PUBLIC_DIR))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.resolve(PUBLIC_DIR, 'index.html'));
})

app.post('/api/matches', async (req, res) => {
  const { teamSize } = req.body

  try {
    const results = await matches.search({
      rules: [
        ['teamSize', '==', teamSize]
      ]
    })

    res.send(results)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

app.post('/api/user', async (req, res) => {
  const { id } = req.body

  try {
    const user = await discord.users.fetch(id)
    res.send(user)
  } catch (err) {
    res.status(500).send(err.message)
  }
})

app.post('/api/guild-user', async (req, res) => {
  const { userId, guildId } = req.body

  try {
    const guild = await discord.guilds.fetch(guildId)
    const user = await guild.members.fetch(userId)
    res.send({
      ...user,
      displayName: user.displayName,
      roles: user.roles.cache
    })
  } catch (err) {
    res.status(500).send(err.message)
  }
})

app.listen(port, () => {
  console.log(`[client-app] listening: http://localhost:${port}`)
})

process.on('exit', () => process.exit())