const express = require('express')
const app = express()
const path = require('path')

app.get('/cards/*', (req, res) => {
  res.sendFile(path.join(__dirname, './docs' + req.path.replace('/cards/', '/')))
})

app.listen(3000, () => console.log('Server listening on port 3000!'))