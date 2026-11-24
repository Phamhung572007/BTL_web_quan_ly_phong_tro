function tinhTienBacThang(tieuThu, bacGia, heSoDinhMuc = 1, cachApGia = 'BAC_THANG') {
  if (!Number.isFinite(tieuThu) || tieuThu < 0) {
    throw new TypeError('Sản lượng tiêu thụ phải là số không âm.');
  }
  if (!Number.isFinite(heSoDinhMuc) || heSoDinhMuc <= 0) {
    throw new TypeError('Hệ số định mức phải là số lớn hơn 0.');
  }
  if (!Array.isArray(bacGia) || bacGia.length === 0) {
    throw new TypeError('Cần cấu hình ít nhất một bậc giá.');
  }

  if (cachApGia === 'DON_GIA_BAC_2') {
    const bacHai = bacGia.find((bac) => bac.bac === 2);
    if (!bacHai) throw new TypeError('Bảng giá chưa cấu hình đơn giá bậc 2.');
    const thanhTien = Math.round(tieuThu * bacHai.donGia);
    return {
      tieuThu,
      tongTien: thanhTien,
      donGiaBinhQuan: tieuThu === 0 ? 0 : bacHai.donGia,
      chiTietBac: tieuThu > 0 ? [{
        bac: 2,
        nguongTu: 0,
        nguongDen: null,
        soLuong: tieuThu,
        donGia: bacHai.donGia,
        thanhTien,
      }] : [],
    };
  }

  if (cachApGia !== 'BAC_THANG') {
    throw new TypeError('Cách áp giá điện/nước không được hỗ trợ.');
  }

  const cacBac = [...bacGia].sort((a, b) => a.nguongTu - b.nguongTu);
  const chiTietBac = [];
  let tongTien = 0;
  let mocTruoc = 0;

  for (const [index, bac] of cacBac.entries()) {
    if (!Number.isFinite(bac.donGia) || bac.donGia < 0) {
      throw new TypeError(`Đơn giá bậc ${index + 1} không hợp lệ.`);
    }

    const nguongTuCoDinh = Number(bac.nguongTu);
    const nguongDenCoDinh = bac.nguongDen == null ? Infinity : Number(bac.nguongDen);
    if (!Number.isFinite(nguongTuCoDinh) || nguongTuCoDinh < 0
      || nguongTuCoDinh !== mocTruoc
      || (Number.isFinite(nguongDenCoDinh) && nguongDenCoDinh <= nguongTuCoDinh)) {
      throw new TypeError(`Khoảng tiêu thụ của bậc ${index + 1} không liên tục hoặc không hợp lệ.`);
    }

    const nguongTu = nguongTuCoDinh * heSoDinhMuc;
    const nguongDen = Number.isFinite(nguongDenCoDinh)
      ? nguongDenCoDinh * heSoDinhMuc
      : null;
    const soLuong = Math.max(0, Math.min(tieuThu, nguongDen ?? Infinity) - nguongTu);

    if (soLuong > 0) {
      const thanhTien = Math.round(soLuong * bac.donGia);
      chiTietBac.push({
        bac: bac.bac ?? index + 1,
        nguongTu,
        nguongDen,
        soLuong,
        donGia: bac.donGia,
        thanhTien,
      });
      tongTien += thanhTien;
    }

    mocTruoc = nguongDenCoDinh;
    if (!Number.isFinite(mocTruoc)) break;
  }

  if (mocTruoc < Infinity && tieuThu > mocTruoc * heSoDinhMuc) {
    throw new TypeError('Bảng giá chưa có bậc cuối bao phủ toàn bộ sản lượng.');
  }

  return {
    tieuThu,
    tongTien,
    donGiaBinhQuan: tieuThu === 0 ? 0 : Math.round(tongTien / tieuThu),
    chiTietBac,
  };
}

module.exports = { tinhTienBacThang };
