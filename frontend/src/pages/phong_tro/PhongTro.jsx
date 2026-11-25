import React, { useEffect, useMemo, useState } from 'react';
import dayTroService from '../../services/dayTroService';
import phongTroService from '../../services/phongTroService';
import './PhongTro.css';

const NOI_THAT_GOI_Y = [
  'Điều hòa',
  'Nóng lạnh',
  'Giường',
  'Tủ quần áo',
  'Kệ bếp',
  'Tủ lạnh',
  'Máy giặt',
  'Ban công',
];

const TRANG_THAI_LABEL = {
  TRONG: 'Trống',
  DANG_O: 'Đang ở',
  BAO_TRI: 'Bảo trì',
};

const FORM_MAC_DINH = {
  dayTroId: '',
  soPhong: '',
  tang: 1,
  giaThue: '',
  tienCocMacDinh: '',
  dienTich: '',
  soNguoiToiDa: 2,
  trangThai: 'TRONG',
  noiThat: [],
  moTa: '',
};

export default function PhongTro() {
  const [danhSachDay, setDanhSachDay] = useState([]);
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thongBao, setThongBao] = useState({ type: '', text: '' });

  // Bộ lọc & Chế độ hiển thị ('SO_DO' | 'DANH_SACH')
  const [locDayTro, setLocDayTro] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('');
  const [tuKhoa, setTuKhoa] = useState('');
  const [cheDoXem, setCheDoXem] = useState('SO_DO');

  // Modal Thêm / Sửa
  const [moModalForm, setMoModalForm] = useState(false);
  const [idDangSua, setIdDangSua] = useState(null);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);

  // Modal Chi tiết phòng
  const [phongChiTiet, setPhongChiTiet] = useState(null);

  const hienThongBao = (type, text) => {
    setThongBao({ type, text });
    setTimeout(() => setThongBao({ type: '', text: '' }), 4000);
  };

  const taiDuLieu = async () => {
    setLoading(true);
    try {
      const [resDay, resPhong] = await Promise.all([
        dayTroService.layDanhSach({ limit: 100 }),
        phongTroService.layDanhSach({
          dayTroId: locDayTro,
          trangThai: locTrangThai,
          tuKhoa,
        }),
      ]);
      setDanhSachDay(resDay.data || []);
      setDanhSachPhong(resPhong.data || []);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, [locDayTro, locTrangThai]);

  // Thống kê nhanh
  const thongKe = useMemo(() => {
    return {
      tong: danhSachPhong.length,
      trong: danhSachPhong.filter((p) => p.trangThai === 'TRONG').length,
      dangO: danhSachPhong.filter((p) => p.trangThai === 'DANG_O').length,
      baoTri: danhSachPhong.filter((p) => p.trangThai === 'BAO_TRI').length,
    };
  }, [danhSachPhong]);

  // Gom nhóm phòng theo Tầng cho chế độ Sơ đồ
  const phongTheoTang = useMemo(() => {
    const groups = {};
    danhSachPhong.forEach((p) => {
      const tang = p.tang ?? 1;
      if (!groups[tang]) groups[tang] = [];
      groups[tang].push(p);
    });
    return Object.keys(groups)
      .sort((a, b) => Number(a) - Number(b))
      .map((tang) => ({ tang, phongs: groups[tang] }));
  }, [danhSachPhong]);

  const moFormThem = () => {
    if (danhSachDay.length === 0) {
      hienThongBao('error', 'Bạn cần tạo ít nhất một Dãy trọ trước khi thêm phòng!');
      return;
    }
    setIdDangSua(null);
    setForm({
      ...FORM_MAC_DINH,
      dayTroId: locDayTro || danhSachDay[0]._id,
    });
    setMoModalForm(true);
  };

  const moFormSua = (phong) => {
    setIdDangSua(phong._id);
    setForm({
      dayTroId: phong.dayTroId?._id || phong.dayTroId || '',
      soPhong: phong.soPhong || '',
      tang: phong.tang ?? 1,
      giaThue: phong.giaThue ?? '',
      tienCocMacDinh: phong.tienCocMacDinh ?? '',
      dienTich: phong.dienTich ?? '',
      soNguoiToiDa: phong.soNguoiToiDa ?? 2,
      trangThai: phong.trangThai || 'TRONG',
      noiThat: phong.noiThat || [],
      moTa: phong.moTa || '',
    });
    setMoModalForm(true);
  };

  const toggleNoiThat = (item) => {
    setForm((prev) => ({
      ...prev,
      noiThat: prev.noiThat.includes(item)
        ? prev.noiThat.filter((i) => i !== item)
        : [...prev.noiThat, item],
    }));
  };

  const handleLuuPhong = async (e) => {
    e.preventDefault();
    setDangLuu(true);
    const payload = {
      dayTroId: form.dayTroId,
      soPhong: form.soPhong.trim(),
      tang: Number(form.tang),
      giaThue: Number(form.giaThue),
      tienCocMacDinh: form.tienCocMacDinh !== '' ? Number(form.tienCocMacDinh) : Number(form.giaThue),
      dienTich: Number(form.dienTich),
      soNguoiToiDa: Number(form.soNguoiToiDa),
      trangThai: form.trangThai,
      noiThat: form.noiThat,
      moTa: form.moTa,
    };

    try {
      if (idDangSua) {
        await phongTroService.capNhat(idDangSua, payload);
        hienThongBao('success', 'Cập nhật thông tin phòng thành công!');
      } else {
        await phongTroService.taoMoi(payload);
        hienThongBao('success', 'Thêm phòng trọ mới thành công!');
      }
      setMoModalForm(false);
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoaPhong = async (phong) => {
    if (!window.confirm(`Xác nhận xóa phòng "${phong.soPhong}"?`)) return;
    try {
      await phongTroService.xoa(phong._id);
      hienThongBao('success', 'Đã xóa phòng trọ.');
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  const handleXemChiTiet = async (phong) => {
    try {
      const res = await phongTroService.layChiTiet(phong._id);
      setPhongChiTiet(res.data);
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  return (
    <div className="phong-tro-page">
      <div className="pt-header">
        <div>
          <h2 className="pt-title">Quản lý Phòng trọ</h2>
          <p className="pt-subtitle">
            Theo dõi sơ đồ tầng, giá thuê, tiện nghi và trạng thái từng phòng (Trống / Đang ở / Bảo trì)
          </p>
        </div>
        <button className="pt-btn-primary" onClick={moFormThem}>
          + Thêm phòng mới
        </button>
      </div>

      {thongBao.text && <div className={`pt-alert ${thongBao.type}`}>{thongBao.text}</div>}

      {/* Thống kê tổng quan */}
      <div className="pt-summary-bar">
        <div className="pt-summary-card">
          <div className="pt-summary-label">Tổng số phòng</div>
          <div className="pt-summary-value">{thongKe.tong}</div>
        </div>
        <div className="pt-summary-card">
          <div className="pt-summary-label">Phòng trống</div>
          <div className="pt-summary-value trong">{thongKe.trong}</div>
        </div>
        <div className="pt-summary-card">
          <div className="pt-summary-label">Đang có người ở</div>
          <div className="pt-summary-value dang-o">{thongKe.dangO}</div>
        </div>
        <div className="pt-summary-card">
          <div className="pt-summary-label">Đang bảo trì</div>
          <div className="pt-summary-value bao-tri">{thongKe.baoTri}</div>
        </div>
      </div>

      {/* Thanh công cụ lọc & chuyển chế độ xem */}
      <div className="pt-toolbar">
        <div className="pt-filters">
          <select className="pt-select" value={locDayTro} onChange={(e) => setLocDayTro(e.target.value)}>
            <option value="">-- Tất cả dãy trọ --</option>
            {danhSachDay.map((d) => (
              <option key={d._id} value={d._id}>
                {d.tenDayTro}
              </option>
            ))}
          </select>

          <select className="pt-select" value={locTrangThai} onChange={(e) => setLocTrangThai(e.target.value)}>
            <option value="">-- Tất cả trạng thái --</option>
            <option value="TRONG">Trống</option>
            <option value="DANG_O">Đang ở</option>
            <option value="BAO_TRI">Bảo trì</option>
          </select>

          <input
            type="text"
            className="pt-input"
            placeholder="Tìm số phòng..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && taiDuLieu()}
          />
          <button className="pt-btn-outline" onClick={taiDuLieu}>
            Lọc
          </button>
        </div>

        <div className="pt-view-switch">
          <button
            className={`pt-btn-outline ${cheDoXem === 'SO_DO' ? 'active' : ''}`}
            onClick={() => setCheDoXem('SO_DO')}
          >
            Sơ đồ tầng
          </button>
          <button
            className={`pt-btn-outline ${cheDoXem === 'DANH_SACH' ? 'active' : ''}`}
            onClick={() => setCheDoXem('DANH_SACH')}
          >
            Danh sách
          </button>
        </div>
      </div>

      {/* Nội dung chính */}
      {loading ? (
        <p className="pt-subtitle">Đang tải danh sách phòng...</p>
      ) : danhSachPhong.length === 0 ? (
        <p className="pt-subtitle">Không có phòng nào phù hợp điều kiện lọc.</p>
      ) : cheDoXem === 'SO_DO' ? (
        <div>
          {phongTheoTang.map(({ tang, phongs }) => (
            <div key={tang} className="pt-floor-section">
              <h3 className="pt-floor-title">
                Tầng {tang} ({phongs.length} phòng)
              </h3>
              <div className="pt-room-grid">
                {phongs.map((p) => (
                  <div key={p._id} className={`pt-room-card ${p.trangThai}`}>
                    <div>
                      <div className="pt-room-top">
                        <span className="pt-room-number">{p.soPhong}</span>
                        <span className={`pt-badge ${p.trangThai}`}>{TRANG_THAI_LABEL[p.trangThai]}</span>
                      </div>
                      <div className="pt-room-meta">{p.dayTroId?.tenDayTro || 'Dãy trọ'}</div>
                      <div className="pt-room-price">{p.giaThue?.toLocaleString('vi-VN')} đ/tháng</div>
                      <div className="pt-room-meta">
                        Diện tích: {p.dienTich}m² • Tối đa {p.soNguoiToiDa} người
                      </div>
                    </div>

                    <div className="pt-card-actions">
                      <button className="pt-btn-sm info" onClick={() => handleXemChiTiet(p)}>
                        Chi tiết
                      </button>
                      <button className="pt-btn-sm" onClick={() => moFormSua(p)}>
                        Sửa
                      </button>
                      <button className="pt-btn-sm danger" onClick={() => handleXoaPhong(p)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pt-table-wrap">
          <table className="pt-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Dãy trọ</th>
                <th>Tầng</th>
                <th>Diện tích</th>
                <th>Giá thuê</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {danhSachPhong.map((p) => (
                <tr key={p._id}>
                  <td>
                    <strong>{p.soPhong}</strong>
                  </td>
                  <td>{p.dayTroId?.tenDayTro || '-'}</td>
                  <td>Tầng {p.tang}</td>
                  <td>{p.dienTich} m²</td>
                  <td>{p.giaThue?.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <span className={`pt-badge ${p.trangThai}`}>{TRANG_THAI_LABEL[p.trangThai]}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="pt-btn-sm info" onClick={() => handleXemChiTiet(p)}>
                        Xem
                      </button>
                      <button className="pt-btn-sm" onClick={() => moFormSua(p)}>
                        Sửa
                      </button>
                      <button className="pt-btn-sm danger" onClick={() => handleXoaPhong(p)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL THÊM / SỬA PHÒNG */}
      {moModalForm && (
        <div className="pt-modal-overlay">
          <div className="pt-modal">
            <div className="pt-modal-header">
              <h3 style={{ margin: 0 }}>{idDangSua ? 'Cập nhật phòng trọ' : 'Thêm phòng trọ mới'}</h3>
              <button className="pt-close-btn" onClick={() => setMoModalForm(false)}>
                ✕
              </button>
            </div>
            <form className="pt-form" onSubmit={handleLuuPhong}>
              <div>
                <label className="pt-label">Thuộc dãy trọ *</label>
                <select
                  required
                  disabled={Boolean(idDangSua)}
                  className="pt-full-input"
                  value={form.dayTroId}
                  onChange={(e) => setForm({ ...form, dayTroId: e.target.value })}
                >
                  {danhSachDay.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.tenDayTro}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-form-row">
                <div>
                  <label className="pt-label">Số phòng / Tên phòng *</label>
                  <input
                    required
                    className="pt-full-input"
                    value={form.soPhong}
                    onChange={(e) => setForm({ ...form, soPhong: e.target.value })}
                    placeholder="VD: P.101"
                  />
                </div>
                <div>
                  <label className="pt-label">Tầng *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="pt-full-input"
                    value={form.tang}
                    onChange={(e) => setForm({ ...form, tang: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-form-row">
                <div>
                  <label className="pt-label">Giá thuê (VNĐ/tháng) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="pt-full-input"
                    value={form.giaThue}
                    onChange={(e) => setForm({ ...form, giaThue: e.target.value })}
                    placeholder="VD: 3200000"
                  />
                </div>
                <div>
                  <label className="pt-label">Tiền cọc mặc định (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    className="pt-full-input"
                    value={form.tienCocMacDinh}
                    onChange={(e) => setForm({ ...form, tienCocMacDinh: e.target.value })}
                    placeholder="Mặc định bằng 1 tháng tiền phòng"
                  />
                </div>
              </div>

              <div className="pt-form-row">
                <div>
                  <label className="pt-label">Diện tích (m²) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="pt-full-input"
                    value={form.dienTich}
                    onChange={(e) => setForm({ ...form, dienTich: e.target.value })}
                    placeholder="VD: 22"
                  />
                </div>
                <div>
                  <label className="pt-label">Số người ở tối đa</label>
                  <input
                    type="number"
                    min="1"
                    className="pt-full-input"
                    value={form.soNguoiToiDa}
                    onChange={(e) => setForm({ ...form, soNguoiToiDa: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="pt-label">Trạng thái phòng</label>
                <select
                  className="pt-full-input"
                  value={form.trangThai}
                  onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                >
                  <option value="TRONG">Trống (Sẵn sàng cho thuê)</option>
                  <option value="DANG_O">Đang ở</option>
                  <option value="BAO_TRI">Đang bảo trì / sửa chữa</option>
                </select>
              </div>

              <div>
                <label className="pt-label">Nội thất sẵn có</label>
                <div className="pt-chip-group">
                  {NOI_THAT_GOI_Y.map((item) => {
                    const active = form.noiThat.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        className={`pt-chip ${active ? 'active' : ''}`}
                        onClick={() => toggleNoiThat(item)}
                      >
                        {active ? '✓ ' : '+ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="pt-label">Mô tả thêm</label>
                <textarea
                  rows={2}
                  className="pt-full-input"
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  placeholder="Ghi chú hướng cửa sổ, đồng hồ điện riêng..."
                />
              </div>

              <div className="pt-modal-footer">
                <button type="button" className="pt-btn-outline" onClick={() => setMoModalForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="pt-btn-primary" disabled={dangLuu}>
                  {dangLuu ? 'Đang lưu...' : idDangSua ? 'Cập nhật phòng' : 'Thêm phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT PHÒNG */}
      {phongChiTiet && (
        <div className="pt-modal-overlay">
          <div className="pt-modal">
            <div className="pt-modal-header">
              <h3 style={{ margin: 0 }}>
                Chi tiết {phongChiTiet.soPhong} - {phongChiTiet.dayTroId?.tenDayTro}
              </h3>
              <button className="pt-close-btn" onClick={() => setPhongChiTiet(null)}>
                ✕
              </button>
            </div>
            <p className="pt-room-meta">
              <strong>Trạng thái:</strong>{' '}
              <span className={`pt-badge ${phongChiTiet.trangThai}`}>
                {TRANG_THAI_LABEL[phongChiTiet.trangThai]}
              </span>
            </p>
            <p className="pt-room-meta">
              <strong>Vị trí:</strong> Tầng {phongChiTiet.tang} • <strong>Diện tích:</strong> {phongChiTiet.dienTich} m² •{' '}
              <strong>Tối đa:</strong> {phongChiTiet.soNguoiToiDa} người
            </p>
            <p className="pt-room-meta">
              <strong>Giá thuê:</strong> {phongChiTiet.giaThue?.toLocaleString('vi-VN')} đ/tháng •{' '}
              <strong>Tiền cọc:</strong> {phongChiTiet.tienCocMacDinh?.toLocaleString('vi-VN')} đ
            </p>
            {phongChiTiet.noiThat?.length > 0 && (
              <p className="pt-room-meta">
                <strong>Nội thất:</strong> {phongChiTiet.noiThat.join(', ')}
              </p>
            )}
            {phongChiTiet.moTa && (
              <p className="pt-room-meta">
                <strong>Mô tả:</strong> {phongChiTiet.moTa}
              </p>
            )}

            {phongChiTiet.hopDongHieuLuc ? (
              <div style={{ marginTop: '14px', padding: '12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <strong style={{ color: '#92400e', fontSize: '14px' }}>Hợp đồng đang hiệu lực</strong>
                <p className="pt-room-meta" style={{ marginTop: '6px' }}>
                  Người thuê đại diện: <strong>{phongChiTiet.hopDongHieuLuc.nguoiThueId?.hoTen || 'Khách thuê'}</strong> ({phongChiTiet.hopDongHieuLuc.nguoiThueId?.soDienThoai || '-'})
                </p>
                <p className="pt-room-meta">
                  Thời hạn: {new Date(phongChiTiet.hopDongHieuLuc.ngayBatDau).toLocaleDateString('vi-VN')} -{' '}
                  {new Date(phongChiTiet.hopDongHieuLuc.ngayKetThuc).toLocaleDateString('vi-VN')}
                </p>
              </div>
            ) : (
              <p className="pt-room-meta" style={{ marginTop: '12px', fontStyle: 'italic' }}>
                Hiện chưa có hợp đồng hiệu lực nào gắn với phòng này.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}