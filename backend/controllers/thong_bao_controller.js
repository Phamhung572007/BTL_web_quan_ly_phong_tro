const ThongBao = require('../models/thong_bao');
const { guiThanhCong, taoMetaPhanTrang } = require('../utils/phan_hoi_api');
const { layPhanTrang } = require('../utils/phan_trang');
const { layNguoiDungId, taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');

async function layDanhSach(req, res) {
  const { page, limit, skip } = layPhanTrang(req.query);
  const filter = { nguoiNhanId: layNguoiDungId(req) };
  if (req.query.chuaDoc === 'true' || req.query['chua-doc'] === 'true') filter.daDocLuc = null;
  const [items, total] = await Promise.all([
    ThongBao.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ThongBao.countDocuments(filter),
  ]);
  return guiThanhCong(res, { message: 'Đã tải thông báo.', data: items, meta: taoMetaPhanTrang({ page, limit, total }) });
}

async function layChuaDoc(req, res) {
  const nguoiNhanId = layNguoiDungId(req);
  const [total, items] = await Promise.all([
    ThongBao.countDocuments({ nguoiNhanId, daDocLuc: null }),
    ThongBao.find({ nguoiNhanId, daDocLuc: null }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  return guiThanhCong(res, { message: 'Đã tải thông báo chưa đọc.', data: { total, items } });
}

async function danhDauDaDoc(req, res) {
  const item = await ThongBao.findOneAndUpdate({
    _id: req.params.maThongBao,
    nguoiNhanId: layNguoiDungId(req),
  }, { $set: { daDocLuc: new Date() } }, { new: true, runValidators: true }).lean();
  if (!item) throw taoLoiHttp(404, 'Không tìm thấy thông báo.');
  return guiThanhCong(res, { message: 'Đã đánh dấu thông báo đã đọc.', data: item });
}

async function danhDauTatCa(req, res) {
  const ketQua = await ThongBao.updateMany({
    nguoiNhanId: layNguoiDungId(req), daDocLuc: null,
  }, { $set: { daDocLuc: new Date() } });
  return guiThanhCong(res, {
    message: `Đã đánh dấu ${ketQua.modifiedCount} thông báo đã đọc.`,
    data: { soThongBaoDaCapNhat: ketQua.modifiedCount },
  });
}

module.exports = { layDanhSach, layChuaDoc, danhDauDaDoc, danhDauTatCa };
