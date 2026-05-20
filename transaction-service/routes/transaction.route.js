const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// baris 7
router.get('/', transactionController.getAll);

// baris 10 (Coba cek di sini, apakah nama fungsinya sama persis?)
router.get('/:id', transactionController.getById);

// baris 13
router.post('/', transactionController.create);

module.exports = router;