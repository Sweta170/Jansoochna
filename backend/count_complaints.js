const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.get("SELECT COUNT(*) as count FROM complaints", (err, row) => {
    if (err) console.error(err);
    else console.log("Complaints count:", row.count);
});

db.close();
