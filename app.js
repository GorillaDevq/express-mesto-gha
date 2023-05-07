const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

// eslint-disable-next-line
const regex = /^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;
const NotFoundError = require('./errors/NotFoundError');

const ValidationError = require('./errors/ValidationError');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.use('*', (req, res, next) => next(new NotFoundError('Ошибка 404')));

app.use(errors());

app.use((err, req, res, next) => {
  if (err.message === 'Validation failed') next(new ValidationError('Переданны некоректные данные'));
  return res.status(500).send({ message: 'Ошибка на сервере' });
});

app.listen(PORT);
