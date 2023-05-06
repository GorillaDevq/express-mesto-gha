const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
      else res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
      else res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const createUser = (req, res) => {
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
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.code === 11000) res.status(409).send({ message: 'Указан существующий email' });
      if (err.name === 'ValidationError') res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
      else res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const login = (req, res) => {
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
      res.status(401).send({ message: err.message });
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
      else res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') res.status(400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      else res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) res.status(404).send({ message: 'Пользователь по указанному _id не найден' });
      else res.send(user);
    })
    .catch((err) => {
      next(err);
    });
};

const getUserInfo = (req, res) => {
  User.findById(req.user)
    .then((user) => {
      res.send(user);
    })
    .catch((err) => res.send({ message: err }));
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
