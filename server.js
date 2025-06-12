const express = require('express');
const path    = require('path');
const student = require('./routes/student');

const app = express();
app.use(express.urlencoded({ extended: true }));    // parse <form>
app.use('/schema', express.static(path.join(__dirname, 'schema')));  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'form.html'));
});

app.use('/submit', student);

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
