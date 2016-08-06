db.anime.createIndex({"_id.i": 1});
db.anime.createIndex({"members": -1});
db.anime.createIndex({"group": 1});
db.anime.createIndex({"characters": 1});

db.char.createIndex({"group": 1});