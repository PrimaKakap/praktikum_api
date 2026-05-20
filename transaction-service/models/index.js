const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 1. Berikan nama property yang unik untuk masing-masing model
db.Transaction = require('./transaction.model')(sequelize, DataTypes);
db.TransactionDetail = require('./transaction_detail.model')(sequelize, DataTypes); // ✅ Sudah diperbaiki nama property-nya

// 2. Set Relasi agar fungsi 'include' di history (getAll / getById) bisa jalan
db.Transaction.hasMany(db.TransactionDetail, { foreignKey: 'transaction_id', as: 'items' });
db.TransactionDetail.belongsTo(db.Transaction, { foreignKey: 'transaction_id' });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = db;