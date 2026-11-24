function laySo(giaTri, tenTruong, { min = 0, max = Number.MAX_SAFE_INTEGER, batBuoc = true } = {}) {
  if (giaTri === undefined || giaTri === null || giaTri === '') {
    if (!batBuoc) return null;
    const error = new Error(`${tenTruong} là bắt buộc.`);
    error.statusCode = 400;
    throw error;
  }
  const so = Number(giaTri);
  if (!Number.isFinite(so) || so < min || so > max) {
    const error = new Error(`${tenTruong} phải là số trong khoảng ${min} đến ${max}.`);
    error.statusCode = 400;
    throw error;
  }
  return so;
}

module.exports = { laySo };
