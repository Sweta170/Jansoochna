const { User, Role } = require('./src/models');

async function promoteToAdmin(email) {
    try {
        const roles = await Role.findAll();
        console.log('Available Roles:', roles.map(r => `${r.name} (${r.id})`).join(', '));

        const adminRole = roles.find(r => r.name === 'admin');
        if (!adminRole) {
            console.error('Admin role not found!');
            return;
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.error(`User with email ${email} not found!`);
            const allUsers = await User.findAll();
            console.log('Existing Users:', allUsers.map(u => `${u.name} (${u.email})`).join(', '));
            return;
        }

        console.log(`Current Role ID for ${user.email}: ${user.role_id}`);

        user.role_id = adminRole.id;
        await user.save();

        console.log(`Successfully promoted ${user.name} (${user.email}) to Admin (Role ID: ${adminRole.id})`);
    } catch (err) {
        console.error('Error:', err);
    }
}

// Get email from command line arg
const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote.js <email>');
} else {
    promoteToAdmin(email);
}
