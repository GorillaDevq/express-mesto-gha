const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/signin', login);
app.post('/signup', createUser);

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

app.use((err, req, res, next) => {
  console.error(err);

  const formattedError = formatError(err);

  res.status(500).send(formattedError);
});

app.listen(PORT);
