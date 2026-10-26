const express = require('express');
const app = express()
const port = 3000

app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ "status": "OK" })
})

const usersRouter = require('./routes/users.routes');
app.use('/users', usersRouter);

const postsRouter = require('./routes/posts.routes');
app.use('/posts', postsRouter);

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
