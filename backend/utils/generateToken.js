const jwt = require('jsonwebtoken');

const generateToken = (id, vaiTro) => {
  return jwt.sign(
    { id, vaiTro },
    process.env.JWT_SECRET || 'secret_key_quan_ly_nha_tro_2026',
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;