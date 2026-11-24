import React, { useEffect, useState } from 'react';
import hopDongService from '../../services/hopDongService';
import phongTroService from '../../services/phongTroService';
import './HopDong.css';

const TRANG_THAI_LABEL = {
  HIEU_LUC: 'Đang hiệu lực',
  DA_KET_THUC: 'Đã thanh lý',
  HUY: 'Đã hủy',
};

const FORM_MAC_DINH = {
  phongTroId: '',
  nguoiThueId: '',
  ngayBatDau: new Date().toISOString().slice(0, 10),
  ngayKetThuc: '',
  giaThueChot: '',
  tienCoc: '',
  chuKyThanhToan: 1,
  ngayThuTienHangThang: 5,
  dieuKhoan: 'Thanh toán tiền phòng từ ngày 01 đến ngày 05 hàng tháng. Báo trước 30 ngày nếu trả phòng.',
};

export default function HopDong() {
  const [danhSachHD, setDanhSachHD] = useState([]);
  const [locTrangThai, setLocTrangThai] = useState('');
  const [loading, setLoading] = useState(true);
  const [thongBao, setThongBao] = useState({ type: '', text: '' });

  // Dữ liệu phục vụ Form lập hợp đồng
  const [danhSachPhongTrong, setDanhSachPhongTrong] = useState([]);
  const [danhSachNguoiThue, setDanhSachNguoiThue] = useState([]);
  const [moModalTao, setMoModalTao] = useState(false);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);

  // Modal Chi tiết / Gia hạn
  const [hdChiTiet, setHdChiTiet] = useState(null);
  const [ngayGiaHanMoi, setNgayGiaHanMoi] = useState('');

  // Modal Thanh lý hợp đồng
  const [hdThanhLy, setHdThanhLy] = useState(null);
  const [ghiChuThanhLy, setGhiChuThanhLy] = useState('');

  const hienThongBao = (type, text) => {
    setThongBao({ type, text });
    setTimeout(() => setThongBao({ type: '', text: '' }), 4500);
  };

  const taiDanhSachHopDong = async () => {
    setLoading(true);
    try {
      const res = await hopDongService.layDanhSach({ trangThai: locTrangThai });
      setDanhSachHD(res.data || []);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDanhSachHopDong();
  }, [locTrangThai]);

  const moFormLapHopDong = async () => {
    try {
      const [resPhong, resNguoiThue] = await Promise.all([
        phongTroService.layPhongTrong({ limit: 100 }),
        hopDongService.layDanhSachNguoiThue().catch(() => ({ data: [] })),
      ]);

      const phongs = resPhong.data || [];
      const nguoiThues = resNguoiThue.data || [];

      if (phongs.length === 0) {
        hienThongBao('error', 'Hiện không còn phòng nào ở trạng thái Trống để lập hợp đồng!');
        return;
      }

      setDanhSachPhongTrong(phongs);
      setDanhSachNguoiThue(nguoiThues);

      const phongDau = phongs[0];
      const motNamSau = new Date();
      motNamSau.setFullYear(motNamSau.getFullYear() + 1);

      setForm({
        ...FORM_MAC_DINH,
        phongTroId: phongDau._id,
        nguoiThueId: nguoiThues[0]?._id || '',
        ngayKetThuc: motNamSau.toISOString().slice(0, 10),
        giaThueChot: phongDau.giaThue ?? '',
        tienCoc: phongDau.tienCocMacDinh ?? phongDau.giaThue ?? '',
      });
      setMoModalTao(true);
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  const handleChonPhong = (phongId) => {
    const phong = danhSachPhongTrong.find((p) => p._id === phongId);
    setForm((prev) => ({
      ...prev,
      phongTroId: phongId,
      giaThueChot: phong ? phong.giaThue : prev.giaThueChot,
      tienCoc: phong ? (phong.tienCocMacDinh ?? phong.giaThue) : prev.tienCoc,
    }));
  };

  const handleTaoHopDong = async (e) => {
    e.preventDefault();
    setDangLuu(true);
    try {
      await hopDongService.taoMoi({
        phongTroId: form.phongTroId,
        nguoiThueId: form.nguoiThueId.trim(),
        ngayBatDau: form.ngayBatDau,
        ngayKetThuc: form.ngayKetThuc,
        giaThueChot: Number(form.giaThueChot),
        tienCoc: Number(form.tienCoc),
        chuKyThanhToan: Number(form.chuKyThanhToan),
        ngayThuTienHangThang: Number(form.ngayThuTienHangThang),
        dieuKhoan: form.dieuKhoan,
      });
      hienThongBao('success', 'Lập hợp đồng mới thành công! Phòng đã tự động chuyển sang trạng thái Đang ở.');
      setMoModalTao(false);
      taiDanhSachHopDong();
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const handleXemChiTiet = async (hd) => {
    try {
      const res = await hopDongService.layChiTiet(hd._id);
      const chiTiet = res.data;
      setHdChiTiet(chiTiet);
      setNgayGiaHanMoi(chiTiet.ngayKetThuc ? chiTiet.ngayKetThuc.slice(0, 10) : '');
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  const handleGiaHan = async () => {
    if (!hdChiTiet || !ngayGiaHanMoi) return;
    setDangLuu(true);
    try {
      await hopDongService.capNhat(hdChiTiet._id, { ngayKetThuc: ngayGiaHanMoi });
      hienThongBao('success', 'Gia hạn ngày kết thúc hợp đồng thành công!');
      setHdChiTiet(null);
      taiDanhSachHopDong();
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const handleXacNhanThanhLy = async (e) => {
    e.preventDefault();
    if (!hdThanhLy) return;
    setDangLuu(true);
    try {
      await hopDongService.ketThuc(hdThanhLy._id, ghiChuThanhLy);
      hienThongBao('success', 'Đã thanh lý hợp đồng và trả trạng thái phòng về Trống.');
      setHdThanhLy(null);
      setGhiChuThanhLy('');
      taiDanhSachHopDong();
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <div className="hop-dong-page">
      <div className="hd-header">
        <div>
          <h2 className="hd-title">Quản lý Hợp đồng thuê</h2>
          <p className="hd-subtitle">
            Lập hợp đồng mới cho phòng trống, gia hạn thời gian thuê và thực hiện thanh lý trả phòng
          </p>
        </div>
        <button className="hd-btn-primary" onClick={moFormLapHopDong}>
          + Lập hợp đồng mới
        </button>
      </div>

      {thongBao.text && <div className={`hd-alert ${thongBao.type}`}>{thongBao.text}</div>}

      {/* Bộ lọc trạng thái */}
      <div className="hd-filter-tabs">
        {[
          { key: '', label: 'Tất cả hợp đồng' },
          { key: 'HIEU_LUC', label: 'Đang hiệu lực' },
          { key: 'DA_KET_THUC', label: 'Đã thanh lý' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`hd-btn-outline ${locTrangThai === tab.key ? 'active' : ''}`}
            onClick={() => setLocTrangThai(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bảng danh sách hợp đồng */}
      {loading ? (
        <p className="hd-subtitle">Đang tải danh sách hợp đồng...</p>
      ) : danhSachHD.length === 0 ? (
        <p className="hd-subtitle">Chưa có hợp đồng nào trong danh mục này.</p>
      ) : (
        <div className="hd-table-wrap">
          <table className="hd-table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Phòng / Dãy trọ</th>
                <th>Người thuê đại diện</th>
                <th>Thời hạn thuê</th>
                <th>Giá chốt / Tiền cọc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachHD.map((hd) => (
                <tr key={hd._id}>
                  <td>
                    <strong>{hd.maHopDongSo || hd._id.slice(-6).toUpperCase()}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{hd.phongTroId?.soPhong || 'Phòng'}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {hd.phongTroId?.dayTroId?.tenDayTro || ''}
                    </div>
                  </td>
                  <td>
                    <div>{hd.nguoiThueId?.hoTen || 'Khách thuê'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {hd.nguoiThueId?.soDienThoai || ''}
                    </div>
                  </td>
                  <td>
                    {new Date(hd.ngayBatDau).toLocaleDateString('vi-VN')} →{' '}
                    {new Date(hd.ngayKetThuc).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div>{hd.giaThueChot?.toLocaleString('vi-VN')} đ/tháng</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Cọc: {hd.tienCoc?.toLocaleString('vi-VN')} đ
                    </div>
                  </td>
                  <td>
                    <span className={`hd-badge ${hd.trangThai}`}>{TRANG_THAI_LABEL[hd.trangThai]}</span>
                  </td>
                  <td>
                    <div className="hd-actions">
                      <button className="hd-btn-sm info" onClick={() => handleXemChiTiet(hd)}>
                        Chi tiết / Gia hạn
                      </button>
                      {hd.trangThai === 'HIEU_LUC' && (
                        <button
                          className="hd-btn-sm danger"
                          onClick={() => {
                            setHdThanhLy(hd);
                            setGhiChuThanhLy('');
                          }}
                        >
                          Thanh lý
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL LẬP HỢP ĐỒNG MỚI */}
      {moModalTao && (
        <div className="hd-modal-overlay">
          <div className="hd-modal">
            <div className="hd-modal-header">
              <h3 style={{ margin: 0 }}>Lập hợp đồng thuê phòng mới</h3>
              <button className="hd-close-btn" onClick={() => setMoModalTao(false)}>
                ✕
              </button>
            </div>
            <form className="hd-form" onSubmit={handleTaoHopDong}>
              <div>
                <label className="hd-label">Chọn phòng trống *</label>
                <select
                  required
                  className="hd-input"
                  value={form.phongTroId}
                  onChange={(e) => handleChonPhong(e.target.value)}
                >
                  {danhSachPhongTrong.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.soPhong} - {p.dayTroId?.tenDayTro || 'Dãy trọ'} ({p.giaThue?.toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="hd-label">Người thuê đại diện *</label>
                {danhSachNguoiThue.length > 0 ? (
                  <select
                    required
                    className="hd-input"
                    value={form.nguoiThueId}
                    onChange={(e) => setForm({ ...form, nguoiThueId: e.target.value })}
                  >
                    {danhSachNguoiThue.map((nt) => (
                      <option key={nt._id} value={nt._id}>
                        {nt.hoTen} - {nt.soDienThoai} {nt.cccd ? `(CCCD: ${nt.cccd})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    className="hd-input"
                    value={form.nguoiThueId}
                    onChange={(e) => setForm({ ...form, nguoiThueId: e.target.value })}
                    placeholder="Nhập ObjectId của Người thuê (tạo từ module Người thuê)"
                  />
                )}
              </div>

              <div className="hd-form-row">
                <div>
                  <label className="hd-label">Ngày bắt đầu *</label>
                  <input
                    required
                    type="date"
                    className="hd-input"
                    value={form.ngayBatDau}
                    onChange={(e) => setForm({ ...form, ngayBatDau: e.target.value })}
                  />
                </div>
                <div>
                  <label className="hd-label">Ngày kết thúc *</label>
                  <input
                    required
                    type="date"
                    className="hd-input"
                    value={form.ngayKetThuc}
                    onChange={(e) => setForm({ ...form, ngayKetThuc: e.target.value })}
                  />
                </div>
              </div>

              <div className="hd-form-row">
                <div>
                  <label className="hd-label">Giá thuê chốt (VNĐ/tháng) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="hd-input"
                    value={form.giaThueChot}
                    onChange={(e) => setForm({ ...form, giaThueChot: e.target.value })}
                  />
                </div>
                <div>
                  <label className="hd-label">Tiền đặt cọc (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="hd-input"
                    value={form.tienCoc}
                    onChange={(e) => setForm({ ...form, tienCoc: e.target.value })}
                  />
                </div>
              </div>

              <div className="hd-form-row">
                <div>
                  <label className="hd-label">Chu kỳ thanh toán (tháng/lần)</label>
                  <input
                    type="number"
                    min="1"
                    className="hd-input"
                    value={form.chuKyThanhToan}
                    onChange={(e) => setForm({ ...form, chuKyThanhToan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="hd-label">Ngày thu tiền hàng tháng (1-28)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    className="hd-input"
                    value={form.ngayThuTienHangThang}
                    onChange={(e) => setForm({ ...form, ngayThuTienHangThang: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="hd-label">Điều khoản hợp đồng</label>
                <textarea
                  rows={3}
                  className="hd-input"
                  value={form.dieuKhoan}
                  onChange={(e) => setForm({ ...form, dieuKhoan: e.target.value })}
                />
              </div>

              <div className="hd-modal-footer">
                <button type="button" className="hd-btn-outline" onClick={() => setMoModalTao(false)}>
                  Hủy
                </button>
                <button type="submit" className="hd-btn-primary" disabled={dangLuu}>
                  {dangLuu ? 'Đang xử lý...' : 'Ký & Lưu hợp đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT & GIA HẠN HỢP ĐỒNG */}
      {hdChiTiet && (
        <div className="hd-modal-overlay">
          <div className="hd-modal">
            <div className="hd-modal-header">
              <h3 style={{ margin: 0 }}>
                Chi tiết hợp đồng {hdChiTiet.maHopDongSo || ''}
              </h3>
              <button className="hd-close-btn" onClick={() => setHdChiTiet(null)}>
                ✕
              </button>
            </div>

            <div className="hd-detail-box">
              <div>
                <strong>Phòng thuê:</strong> {hdChiTiet.phongTroId?.soPhong} —{' '}
                {hdChiTiet.phongTroId?.dayTroId?.tenDayTro}
              </div>
              <div>
                <strong>Người đại diện:</strong> {hdChiTiet.nguoiThueId?.hoTen} ({hdChiTiet.nguoiThueId?.soDienThoai})
              </div>
              <div>
                <strong>Giá thuê chốt:</strong> {hdChiTiet.giaThueChot?.toLocaleString('vi-VN')} đ/tháng •{' '}
                <strong>Tiền cọc:</strong> {hdChiTiet.tienCoc?.toLocaleString('vi-VN')} đ
              </div>
              <div>
                <strong>Thời hạn:</strong> {new Date(hdChiTiet.ngayBatDau).toLocaleDateString('vi-VN')} đến{' '}
                {new Date(hdChiTiet.ngayKetThuc).toLocaleDateString('vi-VN')}
              </div>
              <div>
                <strong>Trạng thái:</strong> {TRANG_THAI_LABEL[hdChiTiet.trangThai]}
              </div>
              {hdChiTiet.dieuKhoan && (
                <div>
                  <strong>Điều khoản:</strong> {hdChiTiet.dieuKhoan}
                </div>
              )}
              {hdChiTiet.ghiChuThanhLy && (
                <div>
                  <strong>Ghi chú thanh lý:</strong> {hdChiTiet.ghiChuThanhLy}
                </div>
              )}
            </div>

            {hdChiTiet.trangThai === 'HIEU_LUC' && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <label className="hd-label">Gia hạn ngày kết thúc mới</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="date"
                    className="hd-input"
                    value={ngayGiaHanMoi}
                    onChange={(e) => setNgayGiaHanMoi(e.target.value)}
                  />
                  <button
                    type="button"
                    className="hd-btn-primary"
                    disabled={dangLuu}
                    onClick={handleGiaHan}
                  >
                    Cập nhật gia hạn
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN THANH LÝ HỢP ĐỒNG */}
      {hdThanhLy && (
        <div className="hd-modal-overlay">
          <div className="hd-modal">
            <div className="hd-modal-header">
              <h3 style={{ margin: 0 }}>Thanh lý / Kết thúc hợp đồng</h3>
              <button className="hd-close-btn" onClick={() => setHdThanhLy(null)}>
                ✕
              </button>
            </div>
            <form className="hd-form" onSubmit={handleXacNhanThanhLy}>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                Bạn đang thực hiện thanh lý hợp đồng phòng{' '}
                <strong>{hdThanhLy.phongTroId?.soPhong}</strong> của khách{' '}
                <strong>{hdThanhLy.nguoiThueId?.hoTen}</strong>. Sau khi xác nhận, phòng sẽ tự động chuyển về
                trạng thái <strong>Trống</strong>.
              </p>
              <div>
                <label className="hd-label">Ghi chú thanh lý / Hoàn cọc</label>
                <textarea
                  rows={3}
                  className="hd-input"
                  value={ghiChuThanhLy}
                  onChange={(e) => setGhiChuThanhLy(e.target.value)}
                  placeholder="VD: Đã kiểm tra tài sản phòng nguyên vẹn, hoàn trả đủ 100% tiền cọc..."
                />
              </div>
              <div className="hd-modal-footer">
                <button type="button" className="hd-btn-outline" onClick={() => setHdThanhLy(null)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="hd-btn-primary"
                  style={{ background: '#dc2626' }}
                  disabled={dangLuu}
                >
                  {dangLuu ? 'Đang xử lý...' : 'Xác nhận thanh lý'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}