import React, { useEffect, useState } from 'react';
import dayTroService from '../../services/dayTroService';
import './DayTro.css';

const TIEN_ICH_GOI_Y = [
  'Bãi giữ xe',
  'Camera 24/7',
  'Cổng vân tay',
  'Thang máy',
  'Wifi miễn phí',
  'Máy giặt chung',
  'PCCC đạt chuẩn',
  'Giờ giấc tự do',
];

const FORM_MAC_DINH = {
  tenDayTro: '',
  soNhaDuong: '',
  phuongXa: '',
  quanHuyen: '',
  tinhThanh: 'Hà Nội',
  lat: '',
  lng: '',
  moTa: '',
  quyDinhChung: '',
  tienIchChung: [],
};

export default function DayTro() {
  const [danhSach, setDanhSach] = useState([]);
  const [tuKhoa, setTuKhoa] = useState('');
  const [loading, setLoading] = useState(true);
  const [thongBao, setThongBao] = useState({ type: '', text: '' });

  const [moModalForm, setMoModalForm] = useState(false);
  const [idDangSua, setIdDangSua] = useState(null);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);

  const [dayChiTiet, setDayChiTiet] = useState(null);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  const hienThongBao = (type, text) => {
    setThongBao({ type, text });
    setTimeout(() => setThongBao({ type: '', text: '' }), 4000);
  };

  const taiDuLieu = async (kw = tuKhoa) => {
    setLoading(true);
    try {
      const res = await dayTroService.layDanhSach({ tuKhoa: kw });
      setDanhSach(res.data || []);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieu('');
  }, []);

  const moFormThem = () => {
    setIdDangSua(null);
    setForm(FORM_MAC_DINH);
    setMoModalForm(true);
  };

  const moFormSua = (day) => {
    const coords = day.viTri?.coordinates || [];
    setIdDangSua(day._id);
    setForm({
      tenDayTro: day.tenDayTro || '',
      soNhaDuong: day.diaChi?.soNhaDuong || '',
      phuongXa: day.diaChi?.phuongXa || '',
      quanHuyen: day.diaChi?.quanHuyen || '',
      tinhThanh: day.diaChi?.tinhThanh || 'Hà Nội',
      lng: coords[0] ?? '',
      lat: coords[1] ?? '',
      moTa: day.moTa || '',
      quyDinhChung: day.quyDinhChung || '',
      tienIchChung: day.tienIchChung || [],
    });
    setMoModalForm(true);
  };

  const toggleTienIch = (item) => {
    setForm((prev) => ({
      ...prev,
      tienIchChung: prev.tienIchChung.includes(item)
        ? prev.tienIchChung.filter((i) => i !== item)
        : [...prev.tienIchChung, item],
    }));
  };

  const handleLuuDayTro = async (e) => {
    e.preventDefault();
    setDangLuu(true);
    const payload = {
      tenDayTro: form.tenDayTro.trim(),
      diaChi: {
        soNhaDuong: form.soNhaDuong.trim(),
        phuongXa: form.phuongXa.trim(),
        quanHuyen: form.quanHuyen.trim(),
        tinhThanh: form.tinhThanh.trim(),
      },
      ...(form.lat !== '' && form.lng !== '' ? { lat: Number(form.lat), lng: Number(form.lng) } : {}),
      moTa: form.moTa,
      quyDinhChung: form.quyDinhChung,
      tienIchChung: form.tienIchChung,
    };

    try {
      if (idDangSua) {
        await dayTroService.capNhat(idDangSua, payload);
        hienThongBao('success', 'Cập nhật dãy trọ thành công!');
      } else {
        await dayTroService.taoMoi(payload);
        hienThongBao('success', 'Thêm dãy trọ mới thành công!');
      }
      setMoModalForm(false);
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoaDayTro = async (day) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa dãy trọ "${day.tenDayTro}"?`)) return;
    try {
      await dayTroService.xoa(day._id);
      hienThongBao('success', 'Đã xóa dãy trọ.');
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  const handleXemChiTiet = async (day) => {
    setDayChiTiet(day);
    setLoadingChiTiet(true);
    try {
      const res = await dayTroService.layChiTiet(day._id);
      setDayChiTiet(res.data);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setLoadingChiTiet(false);
    }
  };

  return (
    <div className="day-tro-page">
      <div className="dt-header">
        <div>
          <h2 className="dt-title">Quản lý Dãy trọ / Tòa nhà</h2>
          <p className="dt-subtitle">
            Quản lý danh sách cơ sở nhà trọ, địa chỉ, tiện ích chung và công suất phòng
          </p>
        </div>
        <button className="dt-btn-primary" onClick={moFormThem}>
          + Thêm dãy trọ mới
        </button>
      </div>

      {thongBao.text && <div className={`dt-alert ${thongBao.type}`}>{thongBao.text}</div>}

      <div className="dt-search-bar">
        <input
          type="text"
          className="dt-search-input"
          placeholder="Tìm theo tên dãy trọ, đường, quận/huyện..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && taiDuLieu(tuKhoa)}
        />
        <button className="dt-btn-outline" onClick={() => taiDuLieu(tuKhoa)}>
          Tìm kiếm
        </button>
      </div>

      {loading ? (
        <p className="dt-subtitle">Đang tải dữ liệu dãy trọ...</p>
      ) : danhSach.length === 0 ? (
        <div className="dt-empty">
          <p>Chưa có dãy trọ nào được tạo.</p>
          <button className="dt-btn-primary" onClick={moFormThem}>
            Tạo dãy trọ đầu tiên
          </button>
        </div>
      ) : (
        <div className="dt-grid">
          {danhSach.map((day) => (
            <div key={day._id} className="dt-card">
              <div>
                <div className="dt-card-top">
                  <h3 className="dt-card-name">{day.tenDayTro}</h3>
                  <span className="dt-badge-total">{day.tongSoPhong || 0} phòng</span>
                </div>

                <p className="dt-address">
                  📍 {day.diaChi?.soNhaDuong}, {day.diaChi?.phuongXa ? `${day.diaChi.phuongXa}, ` : ''}
                  {day.diaChi?.quanHuyen}, {day.diaChi?.tinhThanh}
                </p>

                <div className="dt-stats">
                  <span className="dt-stat-empty">Trống: {day.soPhongTrong || 0}</span>
                  <span className="dt-stat-occupied">Đang ở: {day.soPhongDangO || 0}</span>
                </div>

                {day.tienIchChung?.length > 0 && (
                  <div className="dt-amenities">
                    {day.tienIchChung.map((ti) => (
                      <span key={ti} className="dt-amenity-tag">
                        {ti}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="dt-card-actions">
                <button className="dt-btn-detail" onClick={() => handleXemChiTiet(day)}>
                  Chi tiết
                </button>
                <button className="dt-btn-edit" onClick={() => moFormSua(day)}>
                  Sửa
                </button>
                <button className="dt-btn-delete" onClick={() => handleXoaDayTro(day)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL THÊM / SỬA */}
      {moModalForm && (
        <div className="dt-modal-overlay">
          <div className="dt-modal">
            <div className="dt-modal-header">
              <h3 style={{ margin: 0 }}>{idDangSua ? 'Cập nhật thông tin dãy trọ' : 'Thêm dãy trọ mới'}</h3>
              <button className="dt-close-btn" onClick={() => setMoModalForm(false)}>
                ✕
              </button>
            </div>
            <form className="dt-form" onSubmit={handleLuuDayTro}>
              <div>
                <label className="dt-label">Tên dãy trọ *</label>
                <input
                  required
                  className="dt-input"
                  value={form.tenDayTro}
                  onChange={(e) => setForm({ ...form, tenDayTro: e.target.value })}
                  placeholder="VD: Dãy trọ Xanh - Cơ sở 1"
                />
              </div>

              <div className="dt-form-row-2">
                <div>
                  <label className="dt-label">Tỉnh / Thành phố *</label>
                  <input
                    required
                    className="dt-input"
                    value={form.tinhThanh}
                    onChange={(e) => setForm({ ...form, tinhThanh: e.target.value })}
                  />
                </div>
                <div>
                  <label className="dt-label">Quận / Huyện *</label>
                  <input
                    required
                    className="dt-input"
                    value={form.quanHuyen}
                    onChange={(e) => setForm({ ...form, quanHuyen: e.target.value })}
                    placeholder="VD: Cầu Giấy"
                  />
                </div>
              </div>

              <div className="dt-form-row-1-2">
                <div>
                  <label className="dt-label">Phường / Xã</label>
                  <input
                    className="dt-input"
                    value={form.phuongXa}
                    onChange={(e) => setForm({ ...form, phuongXa: e.target.value })}
                    placeholder="VD: Quan Hoa"
                  />
                </div>
                <div>
                  <label className="dt-label">Số nhà, tên đường *</label>
                  <input
                    required
                    className="dt-input"
                    value={form.soNhaDuong}
                    onChange={(e) => setForm({ ...form, soNhaDuong: e.target.value })}
                    placeholder="VD: Số 15 Ngõ 68 Cầu Giấy"
                  />
                </div>
              </div>

              <div className="dt-form-row-2">
                <div>
                  <label className="dt-label">Vĩ độ (Lat - tùy chọn)</label>
                  <input
                    type="number"
                    step="any"
                    className="dt-input"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    placeholder="VD: 21.0367"
                  />
                </div>
                <div>
                  <label className="dt-label">Kinh độ (Lng - tùy chọn)</label>
                  <input
                    type="number"
                    step="any"
                    className="dt-input"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    placeholder="VD: 105.7905"
                  />
                </div>
              </div>

              <div>
                <label className="dt-label">Tiện ích chung</label>
                <div className="dt-chip-group">
                  {TIEN_ICH_GOI_Y.map((item) => {
                    const active = form.tienIchChung.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        className={`dt-chip ${active ? 'active' : ''}`}
                        onClick={() => toggleTienIch(item)}
                      >
                        {active ? '✓ ' : '+ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="dt-label">Mô tả</label>
                <textarea
                  rows={2}
                  className="dt-textarea"
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  placeholder="Mô tả tổng quan về khu trọ..."
                />
              </div>

              <div>
                <label className="dt-label">Quy định chung</label>
                <textarea
                  rows={2}
                  className="dt-textarea"
                  value={form.quyDinhChung}
                  onChange={(e) => setForm({ ...form, quyDinhChung: e.target.value })}
                  placeholder="VD: Đóng cổng lúc 23h30, không gây ồn ào..."
                />
              </div>

              <div className="dt-modal-footer">
                <button type="button" className="dt-btn-outline" onClick={() => setMoModalForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="dt-btn-primary" disabled={dangLuu}>
                  {dangLuu ? 'Đang lưu...' : idDangSua ? 'Lưu thay đổi' : 'Tạo dãy trọ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {dayChiTiet && (
        <div className="dt-modal-overlay">
          <div className="dt-modal large">
            <div className="dt-modal-header">
              <h3 style={{ margin: 0 }}>{dayChiTiet.tenDayTro}</h3>
              <button className="dt-close-btn" onClick={() => setDayChiTiet(null)}>
                ✕
              </button>
            </div>
            <p className="dt-address">
              <strong>Địa chỉ:</strong> {dayChiTiet.diaChi?.soNhaDuong},{' '}
              {dayChiTiet.diaChi?.phuongXa ? `${dayChiTiet.diaChi.phuongXa}, ` : ''}
              {dayChiTiet.diaChi?.quanHuyen}, {dayChiTiet.diaChi?.tinhThanh}
            </p>
            {dayChiTiet.moTa && (
              <p className="dt-address">
                <strong>Mô tả:</strong> {dayChiTiet.moTa}
              </p>
            )}
            {dayChiTiet.quyDinhChung && (
              <p className="dt-address">
                <strong>Quy định:</strong> {dayChiTiet.quyDinhChung}
              </p>
            )}

            <h4 style={{ margin: '16px 0 6px' }}>
              Danh sách phòng thuộc dãy ({dayChiTiet.danhSachPhong?.length || 0} phòng)
            </h4>
            {loadingChiTiet ? (
              <p className="dt-subtitle">Đang tải danh sách phòng...</p>
            ) : !dayChiTiet.danhSachPhong || dayChiTiet.danhSachPhong.length === 0 ? (
              <p className="dt-subtitle">Dãy trọ này chưa có phòng nào.</p>
            ) : (
              <div className="dt-room-mini-grid">
                {dayChiTiet.danhSachPhong.map((p) => (
                  <div key={p._id} className="dt-room-mini-card">
                    <div style={{ fontWeight: 700 }}>
                      {p.soPhong} (Tầng {p.tang})
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                      {p.giaThue?.toLocaleString('vi-VN')} đ/tháng • {p.dienTich}m²
                    </div>
                    <span className={`dt-room-status ${p.trangThai}`}>
                      {p.trangThai === 'TRONG' ? 'Trống' : p.trangThai === 'DANG_O' ? 'Đang ở' : 'Bảo trì'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}