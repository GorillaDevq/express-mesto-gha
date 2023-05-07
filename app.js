const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');

const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
// eslint-disable-next-line
const regex = /^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;
const NotFoundError = require('./errors/NotFoundError');
const ServerError = require('./errors/ServerError');
const ValidationError = require('./errors/ValidationError');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(regex),
  }),
}), createUser);

app.use(auth);

app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.use('*', (req, res, next) => next(new NotFoundError('Ошибка 404')));

app.use(errors());

app.use((err, req, res, next) => {
  if (err.message === 'Validation failed') next(new ValidationError('Переданны некоректные данные'));
  return new ServerError('Произошла ошибка на сервере');
});

app.listen(PORT);
