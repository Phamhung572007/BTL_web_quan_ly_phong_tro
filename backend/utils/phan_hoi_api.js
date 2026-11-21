function guiThanhCong(res, {
  data = null,
  message = 'Thành công.',
  statusCode = 200,
  meta,
} = {}) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

function guiThatBai(res, {
  data = null,
  message = 'Yêu cầu không thành công.',
  statusCode = 400,
} = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}

function taoMetaPhanTrang({ page = 1, limit = 20, total = 0 } = {}) {
  const trang = Math.max(1, Math.trunc(Number(page) || 1));
  const gioiHan = Math.max(1, Math.trunc(Number(limit) || 20));
  const tong = Math.max(0, Math.trunc(Number(total) || 0));
  const totalPages = Math.ceil(tong / gioiHan);

  return {
    page: trang,
    limit: gioiHan,
    total: tong,
    totalPages,
    hasNextPage: trang < totalPages,
    hasPreviousPage: trang > 1 && totalPages > 0,
  };
}

module.exports = { guiThanhCong, guiThatBai, taoMetaPhanTrang };
