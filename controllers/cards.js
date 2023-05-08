const Card = require('../models/card');

const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getCards = (req, res, next) => {
  Card.find({})
    .populate(['likes', 'owner'])
    .then((cardList) => res.send(cardList))
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .populate('owner')
    .then((card) => {
      if (!card) next(new NotFoundError('Карточка с указанным _id не найдена'));
      else if (String(req.user._id) === String(card.owner._id)) {
        Card.deleteOne()
          .then(() => res.send({ message: 'Карточка успешно удалена' }))
          .catch(next);
      } else next(new ForbiddenError('Нет доступа'));
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new ValidationError('Переданы некорректные данные для удаления карточки'));
      else next(err);
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => card.populate('owner'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new ValidationError('Переданы некорректные данные для удаления карточки'));
      else next(err);
    });
};

const putLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) next(new NotFoundError('Передан несуществующий _id карточки'));
      else res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new ValidationError('Переданы некорректные данные для постановки лайка'));
      else next(err);
    });
};

const deleteLike = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) next(new NotFoundError('Передан несуществующий _id карточки'));
      else res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new ValidationError('Переданы некорректные данные для снятия лайка'));
      else next(err);
    });
};

module.exports = {
  getCards,
  deleteCard,
  createCard,
  putLike,
  deleteLike,
};
