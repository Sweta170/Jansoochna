const { User, Role } = require('./src/models');
const bcrypt = require('bcrypt');

async function create() {
    try {
        let adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            console.log('Creating admin role...');
            adminRole = await Role.create({ name: 'admin' });
        }
        const hash = await bcrypt.hash('admin123', 10);
        const [user, created] = await User.findOrCreate({
            where: { email: 'admin@jansoochna.gov.in' },
            defaults: {
                name: 'System Admin',
                email: 'admin@jansoochna.gov.in',
                password_hash: hash,
                role_id: adminRole.id
            }
        });

        if (created) {
            console.log('Admin user created successfully.');
        } else {
            user.password_hash = hash;
            user.role_id = adminRole.id;
            await user.save();
            console.log('Admin user already existed, password reset to admin123.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

create();
