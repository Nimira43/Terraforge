const express = require('express')
const userRouter = require('./api/router')
const app = express()
const port = 3000

app.use(express.urlencoded())
app.use('/api', userRouter)

app.get('/', (req, res) => {
  res.send(`
    <h1>Strātō Server is running</h1>  
  `)
})

app.listen(port,  () => {
  console.log(`Strātō Server is started on Port: ${port}`)
})