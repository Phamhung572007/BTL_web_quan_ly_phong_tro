const { guiThatBai } = require('../utils/phan_hoi_api');

function layLoiMongoose(error) {
  if (error.name === 'ValidationError' && error.errors) {
    return Object.values(error.errors).map((loi) => ({
      field: loi.path,
      message: loi.message,
    }));
  }

  if (error.name === 'CastError') {
    return [{ field: error.path, message: 'Giá trị định danh hoặc kiểu dữ liệu không hợp lệ.' }];
  }

  return null;
}

function xuLyLoi(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = Number(error.statusCode || error.status) || 500;
  let message = error.message || 'Đã xảy ra lỗi máy chủ.';
  let data = null;

  const loiMongoose = layLoiMongoose(error);
  if (loiMongoose) {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ.';
    data = { errors: loiMongoose };
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại.';
    data = { fields: Object.keys(error.keyPattern || error.keyValue || {}) };
  } else if (error.name === 'MulterError') {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Tệp tải lên vượt quá dung lượng cho phép.'
      : 'Tệp tải lên không hợp lệ.';
  } else if (['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
    statusCode = 401;
    message = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
  }

  if (statusCode < 400 || statusCode > 599) statusCode = 500;
  if (statusCode >= 500) {
    if (process.env.NODE_ENV === 'production') {
      message = 'Đã xảy ra lỗi máy chủ.';
    } else {
      console.error(error);
    }
  }

  return guiThatBai(res, { statusCode, message, data });
}

module.exports = xuLyLoi;
module.exports.xuLyLoi = xuLyLoi;
