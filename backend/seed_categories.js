const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const categories = [
    { name: 'Infrastructure', description: 'Roads, bridges, buildings' },
    { name: 'Sanitation', description: 'Garbage, sewage, cleanliness' },
    { name: 'Public Safety', description: 'Crime, accidents, hazards' },
    { name: 'Health', description: 'Hospitals, clinics, diseases' },
    { name: 'Education', description: 'Schools, colleges, libraries' }
];

db.serialize(() => {
    const stmt = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
    categories.forEach(c => {
        stmt.run(c.name, c.description, (err) => {
            if (err) console.error("Error inserting category " + c.name + ":", err.message);
            else console.log("Inserted category: " + c.name);
        });
    });
    stmt.finalize();
});

db.close();
