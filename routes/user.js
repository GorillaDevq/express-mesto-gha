const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// eslint-disable-next-line
const regex = /^(http|https):\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;

const {
  getUser,
  getUsers,
  updateProfile,
  updateAvatar,
  getUserInfo,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getUserInfo);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regex),
  }),
}), updateAvatar);

router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().required(),
  }),
}), getUser);

module.exports = router;
