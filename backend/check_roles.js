const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.get("SELECT COUNT(*) as count FROM roles", (err, row) => {
    if (err) console.error(err);
    else console.log("Roles count:", row.count);
});

db.close();
