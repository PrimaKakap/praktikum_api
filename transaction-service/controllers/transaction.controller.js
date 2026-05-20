const { Transaction, TransactionDetail } = require('../models'); 
const axios = require('axios');

const USER_SERVICE_URL = 'http://localhost:3001/api/users';
const PRODUCT_SERVICE_URL = 'http://localhost:3002/api/products';

// 1. GET ALL TRANSACTIONS
const getAll = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [{ model: TransactionDetail, as: 'items' }] // Menampilkan detail barangnya sekalian
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET TRANSACTION BY ID (Untuk History Detail)
const getById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [{ model: TransactionDetail, as: 'items' }] // Menampilkan detail barangnya sekalian
    });
    
    if (!transaction) return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { userId, items } = req.body; 

    // --- A. VALIDASI USER DAN AMBIL DATA USER 🚀 ---
    let userName = "Unknown User"; // Sediakan variabel default
    try {
      // Tembak user service dan tampung responnya
      const responseUser = await axios.get(`${USER_SERVICE_URL}/${userId}`);
      
      // Pastikan nama properti sesuai dengan field di database user kamu (misal: responseUser.data.name atau username)
      userName = responseUser.data.name || responseUser.data.username || "User"; 
    } catch (error) {
      return res.status(404).json({ error: 'User tidak ditemukan atau User Service mati!' });
    }

    let totalOrderPrice = 0;
    let validatedItems = [];

    // --- B. LOOPING UNTUK VALIDASI SETIAP BARANG KE PRODUCT SERVICE ---
    for (const item of items) {
      try {
        const responseProduct = await axios.get(`${PRODUCT_SERVICE_URL}/${item.productId}`);
        const product = responseProduct.data;

        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Stok produk '${product.name}' tidak mencukupi!`,
            info: `Stok tersedia: ${product.stock}, diminta: ${item.quantity}`
          });
        }

        const subTotal = product.price * item.quantity;
        totalOrderPrice += subTotal;

        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          pricePerItem: product.price
        });

      } catch (error) {
        return res.status(404).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan!` });
      }
    }

    // --- C. SIMPAN KE TABEL UTAMA (TRANSACTIONS) ---
    const transaction = await Transaction.create({
      userId,
      totalPrice: totalOrderPrice,
      status: 'SUCCESS'
    });

    // --- D. SIMPAN SEMUA BARANG KE TABEL DETAIL (TRANSACTION_DETAILS) ---
    for (const validItem of validatedItems) {
      await TransactionDetail.create({
        transaction_id: transaction.id, 
        product_id: validItem.productId,
        quantity: validItem.quantity,
        price_per_item: validItem.pricePerItem
      });
    }

    // --- E. OUTPUT RESPON AKHIR DI POSTMAN (Ditambahkan nama user) ---
    res.status(201).json({
      message: "Transaksi banyak barang berhasil di-input lewat Axios!",
      transactionId: transaction.id,
      userId: userId,
      buyerName: userName, // 👈 NAMA USER MUNCUL DI SINI!
      totalBayar: totalOrderPrice,
      detailBarang: validatedItems
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXPORT SEMUA FUNGSI (Pastikan namanya ada semua di atas)
module.exports = {
  getAll,
  getById,
  create
};