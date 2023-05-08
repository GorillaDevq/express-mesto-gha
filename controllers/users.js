const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((user) => {
      if (!user) next(new NotFoundError('Пользователь по указанному _id не найден'));
      else res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new ValidationError('Переданы некорректные данные для поиска пользователя'));
      else next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      password: hash,
      email,
    }))
    .then((user) => {
      const { _id, name, about, avatar, email } = user; // eslint-disable-line
      const newUser = { _id, name, about, avatar, email }; // eslint-disable-line
      res.status(201).send(newUser); // Select: false не отрабатывает
    })
    .catch((err) => {
      if (err.code === 11000) next(new ConflictError('Указан существующий email'));
      else if (err.name === 'ValidationError') next(new ValidationError('Переданы некорректные данные при создании пользователя'));
      else next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
      });
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) next(new NotFoundError('Пользователь по указанному _id не найден'));
      else res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
      else next(err);
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) next(new NotFoundError('Пользователь по указанному _id не найден'));
      else res.send(user);
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getUserInfo,
};
