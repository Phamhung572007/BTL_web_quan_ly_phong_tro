function layPhanTrang(query = {}) {
  const page = Math.max(1, Math.trunc(Number(query.page) || 1));
  const limit = Math.min(100, Math.max(1, Math.trunc(Number(query.limit) || 20)));
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { layPhanTrang };
