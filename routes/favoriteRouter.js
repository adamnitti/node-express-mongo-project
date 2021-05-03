const express = require('express');
const Favorite = require('../models/favorite');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user:req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(favorite)
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            req.body.forEach(reqFavorite => {
                if (!favorite.campsites.includes(reqFavorite._id)) {
                    favorite.campsites.push(reqFavorite._id);
                }
            })
            favorite.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            Favorite.create({user: req.user._id})
            .then(favorite => {
                req.body.forEach(reqFavorite => {
                    if (!favorite.campsites.includes(reqFavorite._id)) {
                        favorite.campsites.push(reqFavorite._id);
                    }
                });
                favorite.save();
                console.log('Favorite Created', favorite);
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-type', 'text/plain');
            res.end('You do not have any favorites to delete');
        }
    })
    .catch(err => next(err));
});



favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/plain');
                res.end('That campsite is already in the list of favorites!');
            }
        } else {
            Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
            .then(favorite => {
            console.log('Favorite Created', favorite);
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            console.log(favorite);
            console.log(index);
            if (index > -1) {
                favorite.campsites.splice(index, 1);
                console.log(favorite.campsites);
                favorite.save();
                console.log('Favorite deleted', favorite);
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favorite);

            } else {
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/plain');
                res.end(`Campsite with ID ${req.params.campsiteId} is not a favorite campsite!`);
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-type', 'text/plain');
            res.end('There are no favorites to delete!');
        }
    })
    .catch(err => next(err));
    
})

module.exports = favoriteRouter;