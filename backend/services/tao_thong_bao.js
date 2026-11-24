const mongoose = require('mongoose');
const ThongBao = require('../models/thong_bao');

async function guiThongBao({ nguoiNhanIds, nguoiGuiId = null, loaiThongBao, tieuDe, noiDung, duongDan, doiTuongModel, doiTuongId }) {
  const ids = [...new Set((nguoiNhanIds || []).filter(Boolean).map(String))]
    .filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!ids.length) return;
  try {
    await ThongBao.insertMany(ids.map((id) => ({
      nguoiNhanId: id,
      nguoiGuiId,
      loaiThongBao,
      tieuDe,
      noiDung,
      duongDan: duongDan || '',
      doiTuongModel,
      doiTuongId,
    })), { ordered: false });
  } catch (error) {
    console.error('Không thể lưu thông báo liên quan:', error.message);
  }
}

async function layTaiKhoanNguoiThue(nguoiThueIds = []) {
  const ids = nguoiThueIds.map((id) => mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(String(id)) : null).filter(Boolean);
  if (!ids.length) return [];
  const records = await mongoose.connection.collection('nguoithues').find(
    { _id: { $in: ids }, taiKhoanId: { $ne: null } },
    { projection: { taiKhoanId: 1 } },
  ).toArray();
  return records.map((record) => record.taiKhoanId);
}

module.exports = { guiThongBao, layTaiKhoanNguoiThue };
