const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');

const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
// eslint-disable-next-line
const regex = /^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

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
    avatar: Joi.string(),
  }),
}), createUser);

app.use(auth);

app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Ошибка 404' });
});

function formatError(error) {
  return {
    message: 'Произошла ошибка на сервере',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  };
}

app.use((err, req, res, next) => { // eslint-disable-line
  const formattedError = formatError(err);

  if (err.message === 'Validation failed') res.status(400).send(formattedError);

  res.status(500).send(formattedError);
});

app.use(errors());

app.listen(PORT);
