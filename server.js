const express = require('express');
const cors = require('cors');
const path = require('path');
const { translate } = require('./src/translate');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/convert', (req, res) => {
  try {
    const { mongoQuery } = req.body;
    // translate expects a full string like: db.users.find({age:{$gt:21}}, {name:1})
    const result = translate(mongoQuery);
    res.json({ sql: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'ui/build')));
app.get('/{*path}', (req, res) =>
  res.sendFile(path.join(__dirname, 'ui/build/index.html'))
);

app.listen(3001, () => console.log('API running on http://localhost:3001'));