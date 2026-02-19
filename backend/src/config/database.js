const { Sequelize } = require('sequelize');
const path = require('path');

// Check if we are in production or if MySQL var is set
const isProduction = process.env.NODE_ENV === 'production';
const useMySQL = process.env.DB_HOST || isProduction;

let sequelize;

if (useMySQL) {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'jansoochna',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'changeme',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
} else {
  // SQLite Fallback for local dev without Docker
  console.log(' Using SQLite fallback (local dev)');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
