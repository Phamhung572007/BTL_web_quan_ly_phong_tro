const mongoose = require('mongoose');
const { taoLoiHttp } = require('../middleware/yeu_cau_quyen_chu_tro');

function doiObjectId(giaTri) {
  if (giaTri instanceof mongoose.Types.ObjectId) return giaTri;
  if (!mongoose.Types.ObjectId.isValid(giaTri)) return null;
  return new mongoose.Types.ObjectId(giaTri);
}

async function layPhong(phongTroId, chuTroId) {
  const id = doiObjectId(phongTroId);
  const ownerId = doiObjectId(chuTroId);
  if (!id || !ownerId) throw taoLoiHttp(400, 'Mã phòng không hợp lệ.');
  const phong = await mongoose.connection.collection('phongtros').findOne({
    _id: id,
    chuTroId: ownerId,
    daXoaLuc: null,
  });
  if (!phong) throw taoLoiHttp(404, 'Không tìm thấy phòng thuộc quyền quản lý của bạn.');
  return phong;
}

async function layPhongMap(danhSachPhongId) {
  const ids = [...new Set(danhSachPhongId.filter(Boolean).map(String))]
    .map(doiObjectId).filter(Boolean);
  if (!ids.length) return new Map();
  const phong = await mongoose.connection.collection('phongtros')
    .find({ _id: { $in: ids } }, { projection: { soPhong: 1, tenPhong: 1, dayTroId: 1 } })
    .toArray();
  return new Map(phong.map((item) => [String(item._id), item]));
}

module.exports = { doiObjectId, layPhong, layPhongMap };
