const { Department, Role } = require('../src/models');

async function seedDepartments() {
    const departments = [
        { name: 'Roads & Infrastructure', description: 'Potholes, broken streetlights, road repairs' },
        { name: 'Water Supply', description: 'No water, leakage, contaminated water' },
        { name: 'Electricity', description: 'Power cuts, dangerous wiring, transformer issues' },
        { name: 'Waste Management', description: 'Garbage collection, overflowing bins, sanitation' },
        { name: 'Health', description: 'Public clinics, vector control, food safety' },
        { name: 'Revenue', description: 'Tax collection, land records' },
        { name: 'Police / Law & Order', description: 'Crime, safety, traffic' }
    ];

    for (const dept of departments) {
        await Department.findOrCreate({
            where: { name: dept.name },
            defaults: dept
        });
    }
    console.log('Departments seeded');
}

async function seedOfficialRole() {
    await Role.findOrCreate({ where: { name: 'official' } });
    console.log("'official' role seeded");
}

module.exports = { seedDepartments, seedOfficialRole };
