const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .populate(['likes', 'owner'])
    .then((cardList) => res.send(cardList))
    .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию' }));
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
      else res.send(card);
    })
    .catch(() => res.status(500).send({ message: 'Ошибка по умолчанию' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => card.populate('owner'))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
      else res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};

const putLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      else res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка' });
      else res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};

const deleteLike = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) res.status(404).send({ message: 'Передан несуществующий _id карточки' });
      else res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(400).send({ message: 'Переданы некорректные данные для снятия лайка' });
      else res.status(500).send({ message: 'Ошибка по умолчанию' });
    });
};

module.exports = {
  getCards,
  deleteCard,
  createCard,
  putLike,
  deleteLike,
};
