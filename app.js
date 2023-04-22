const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '644161e67b92c0a55ae94437',
  };

  next();
});

app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Ошибка 404' });
});

app.listen(PORT);
