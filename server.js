const port = process.env.PORT || 3000

const express = require('express')

const app = express()
app.use(express.static('public'))

app.listen(port, () => {
  console.log('App listening at port ' +  port)
})
