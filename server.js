const express = require('express');
const app = express();
const port = 3000;

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const db = require('./db');

app.get('/', (req, res) => {
    res.sendFile(path.join(___dirname, 'public', 'index.html'));
});

const apiRouter = require('./routes/api');
app.use(express.json());
app.use('/api/users', apiRouter );

app.listen(port, () => {
    console.log(`Server funfionando em http://localhost:${port}`);
})


