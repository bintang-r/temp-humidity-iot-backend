const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Buat token (berlaku 1 hari)
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_username, new_password } = req.body;

    if (!current_password) {
      return res.status(400).json({ message: 'Password saat ini harus diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Password saat ini salah' });
    }

    let updateQuery = 'UPDATE users SET ';
    const updateParams = [];

    if (new_username) {
      // Cek apakah username baru sudah dipakai orang lain
      const [existing] = await pool.query('SELECT * FROM users WHERE username = ? AND id != ?', [new_username, userId]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
      updateQuery += 'username = ?';
      updateParams.push(new_username);
    }

    if (new_password) {
      if (updateParams.length > 0) updateQuery += ', ';
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateQuery += 'password = ?';
      updateParams.push(hashedPassword);
    }

    if (updateParams.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diubah' });
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(userId);

    await pool.query(updateQuery, updateParams);

    res.json({ message: 'Akun berhasil diperbarui' });
  } catch (error) {
    console.error('Error update account:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, created_at FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password harus diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    
    res.json({ message: 'Pengguna berhasil ditambahkan', user: { id: result.insertId, username } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Jangan izinkan admin menghapus dirinya sendiri
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri' });
    }

    // Pastikan setidaknya ada 1 admin tersisa di db (opsional, tapi baik untuk keamanan)
    const [users] = await pool.query('SELECT id FROM users');
    if (users.length <= 1) {
      return res.status(400).json({ message: 'Tidak dapat menghapus pengguna terakhir' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
