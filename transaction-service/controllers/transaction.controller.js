const { Transaction } = require('../models'); // HANYA memanggil model Transaction lokal
const axios = require('axios');

// Alamat URL dari service sebelah (pastikan port-nya sesuai dengan .env masing-masing)
const USER_SERVICE_URL = 'http://localhost:3001/api/users';
const PRODUCT_SERVICE_URL = 'http://localhost:3002/api/products';

// 1. GET ALL TRANSACTIONS
exports.getAll = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET TRANSACTION BY ID
exports.getById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. CREATE TRANSACTION (POST) - DI SINI AXIOS BEKERJA 🚀
exports.create = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // --- A. TEMBAK PRODUCT SERVICE (PORT 3002) MENGGUNAKAN AXIOS ---
    let product;
    try {
      const responseProduct = await axios.get(`${PRODUCT_SERVICE_URL}/${productId}`);
      product = responseProduct.data; // Ambil data produk hasil tembakan
    } catch (error) {
      return res.status(404).json({ error: 'Produk tidak ditemukan atau Product Service mati!' });
    }

    // --- B. TEMBAK USER SERVICE (PORT 3001) MENGGUNAKAN AXIOS ---
    try {
      await axios.get(`${USER_SERVICE_URL}/${userId}`);
    } catch (error) {
      return res.status(404).json({ error: 'User tidak ditemukan atau User Service mati!' });
    }

    // --- C. HITUNG TOTAL HARGA (Data price didapat dari object product hasil Axios tadi) ---
    // Pastikan nama kolom 'price' di db_product_service kamu sama hurufnya (misal: price atau harga)
    const totalPrice = product.price * quantity; 

    // --- D. SIMPAN KE DATABASE LOKAL TRANSAKSI ---
    const transaction = await Transaction.create({
      userId,         // Pastikan nama kolom di model/migration kamu adalah userId atau user_id
      productId,      // Pastikan nama kolom di model/migration kamu adalah productId atau product_id
      quantity,
      totalPrice      // Pastikan nama kolom di model/migration kamu adalah totalPrice atau total_price
    });

    res.status(201).json({
      message: "Transaksi berhasil di-input lewat Axios!",
      data: transaction
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};