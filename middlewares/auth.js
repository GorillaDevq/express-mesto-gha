const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

module.exports = (req, res, next) => {  // eslint-disable-line
  if (!req.cookies.token) return next(new UnauthorizedError('Ошибка авторизации.'));

  let payload;

  try {
    payload = jwt.verify(req.cookies.token, 'super-strong-secret');
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload;

  next();
};
