const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // Add created_at column
    db.run("ALTER TABLE complaints ADD COLUMN created_at DATETIME", (err) => {
        if (err) console.error("Error adding created_at:", err.message);
        else console.log("Added created_at column");
    });

    // Add updated_at column
    db.run("ALTER TABLE complaints ADD COLUMN updated_at DATETIME", (err) => {
        if (err) console.error("Error adding updated_at:", err.message);
        else console.log("Added updated_at column");
    });

    // Update existing rows with current time
    db.run("UPDATE complaints SET created_at = datetime('now') WHERE created_at IS NULL", (err) => {
        if (err) console.error("Error updating rows:", err.message);
        else console.log("Updated existing rows with current timestamp");
    });
});

db.close();
