

/* GET home page. */


var express = require('express');
// var postgres = require('../logics/connect-db').postgres();
var postgres = require('../logics/connect-db').postgres();
var router = express.Router();
var convStr = require('../logics/convStr').convStr
var EventEmitter = require('events').EventEmitter;

/* GET home page. */

// router.get('/musics', function(req, res, next) {
// 	res.send({
// 		rowsNum: 'musics'
// 	});
// });

router.get('/musics', function(req, res, next) {
	var events = new EventEmitter;
	postgres.get_musics(
		events, 
		req.query.artist_id,
		req.query.limit,
		req.query.start
	);
	events.on('finish', function(rows){
		res.send({
			musics: rows
		});
	});
});

router.get('/musics/:id', function(req, res, next) {
	var events = new EventEmitter;
	postgres.get_musics_id(
		events, 
		req.params['id']
	);
	events.on('finish', function(rows){
		res.send({
			musics: rows
		});
	});
});

router.post('/musics', function(req, res, next) {
	var events = new EventEmitter;
	// var req.body.
	postgres.post_musics(
		events, 
		req.body.artist_id,
		req.body.title,
		req.body.outline
	);
	events.on('success', function(url){
		res.location(url)
		res.status(201).end();
	});

	events.on('failed', function(url){
		res.status(400).end();
	});
});

router.put('/musics/:id', function(req, res, next) {
	var events = new EventEmitter;
	postgres.put_musics_id(
		events, 
		req.params.id,
		req.body.artist_id,
		req.body.title,
		req.body.outline
	);

	events.on('success', function(url){
		res.location(url)
		res.status(201).end();
	});

	events.on('failed', function(url){
		res.status(400).end();
	});
});


router.delete('/musics/:id', function(req, res, next) {
	var events = new EventEmitter;
	postgres.delete_musics_id(
		events, 
		req.params.id
	);

	events.on('success', function(url){
		res.status(204).end();
	});

	events.on('not_exist', function(url){
		res.status(404).end();
	});
});

module.exports = router;

