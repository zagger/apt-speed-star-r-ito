
var pg = require('pg');
var http = require('http');
var port = process.env.PORT || '3000';

function postgres() {
	// var conSt = process.env.PG_URL || "postgres://postgres:user@localhost:5432/test";
	var conSt = process.env.HEROKU_POSTGRESQL_SILVER_URL 
		|| "postgres://user:user@localhost:5432/mylocaldb";
	var client = new pg.Client(conSt);
	client.connect();

	function surr(str) {
		return '\'' + str +'\''
	}


	return {
		get_musics: function(events, artist_id, _limit, _start) {
			var limit = _limit || 100;
			var start = _start || 0;
			var where = "";

			if(artist_id) {
				where = ' where artist_id = ' + artist_id;
			}else {
				where = '';
			}

			var query = client.query(
				'select * from music '
				+ where
				+ ' limit '
				+ limit
				+ ' offset '
				+ start
				+ ';'
			);

			var rows=[];
			query.on('row', function(row, res) {
				rows.push(row);
			});

			query.on('end', function(result) {
				events.emit('finish', rows);
			});
		},

		get_musics_id: function(events, id) {
			var query = client.query(
				'select * from music where id = ' + id + ';'
			);

			var rows=[];
			query.on('row', function(row, res) {
				rows.push(row);
			});

			query.on('end', function(result) {
				events.emit('finish', rows);
			});
		},

		post_musics: function(events, artist_id, title, outline) {

			if(!(artist_id && title)) {
				events.emit('failed');
			}

			function insert() {
				if(outline) {
					var query = client.query(
						// 'insert into music (artist_id, title, outline) values (' + artist_id + ',' +  title + ',' + outline + ');'
						'insert into music (artist_id, title, outline) values ( 1, \'' + title + '\',\'' + outline + '\');'
					);
				}else {
					var query = client.query(
						// 'insert into music (artist_id, title) values (' + artist_id + ',' +  title + ');'
						'insert into music (artist_id, title) values ( 1, \'' + title + '\');'
					);
				}

				query.on('end', function(rows) {
					events.emit('success', rows);
				});

				query.on('row', function(row, res) {
					rows.push(row);
				});
			}

			var rows=[];
			var url = 'http://localhost:' + port + '/api/musics/' + '?artist_id=' + artist_id;
			http.get(url, function(res) {
				var body = '';
			
				res.on('data', function(chunk) {
					body += chunk;
				});
			
				res.on('end', function() {
					var json = JSON.parse(body)
					if(json.musics.length === 0) {
						events.emit('failed');
					}else {
						insert();
					}
				});
			}).on('error', function(e) {
				console.log("Got error: ", e);
			});
		},

		put_musics_id: function(events, id, artist_id, title, outline) {

			if(!(artist_id && title)) {
				events.emit('failed');
			}

			function update() {
				if(outline) {
					var query = client.query(
						// 'insert into music (artist_id, title, outline) values (' + artist_id + ',' +  title + ',' + outline + ');'
						'update music set artist_id=' + artist_id + ', title=' + surr(title) + ', outline=' + surr(outline) 
						+ ' where id=' + id + ';'
					);
				}else {
					var query = client.query(
						// 'insert into music (artist_id, title) values (' + artist_id + ',' +  title + ');'
						'update music set artist_id=' + artist_id + ', title=' + surr(title) 
						+ ' where id=' + id + ';'
					);
				}

				query.on('end', function(rows) {
					events.emit('success', rows);
				});

				query.on('row', function(row, res) {
					rows.push(row);
				});
			}

			var rows=[];
			var url = 'http://localhost:' + port + '/api/musics/' + id;
			http.get(url, function(res) {
				var body = '';
			
				res.on('data', function(chunk) {
					body += chunk;
				});
			
				res.on('end', function() {
					var json = JSON.parse(body)
					if(json.musics.length === 0) {
						events.emit('failed');
					}else {
						update();
					}
				});
			}).on('error', function(e) {
				console.log("Got error: ", e);
			});
		},

		delete_musics_id: function(events, id) {

			function deleting() {
				var query = client.query(
					'delete from music where id=' + id  + ';'
				);
				query.on('end', function(rows) {
					events.emit('success', rows);
				});
			}

			var rows=[];
			var url = 'http://localhost:' + port + '/api/musics/' + id;
			http.get(url, function(res) {
				var body = '';
			
				res.on('data', function(chunk) {
					body += chunk;
				});
			
				res.on('end', function() {
					var json = JSON.parse(body)
					if(json.musics.length === 0) {
						events.emit('failed');
					}else {
						deleting();
					}
				});
			}).on('error', function(e) {
				console.log("Got error: ", e);
			});
		}
	}
}

exports.postgres = postgres;
