import { useCallback, useEffect, useState } from 'react';
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

  // Modal Thêm / Sửa
  const [moModalForm, setMoModalForm] = useState(false);
  const [idDangSua, setIdDangSua] = useState(null);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [dangLuu, setDangLuu] = useState(false);

  // Modal Chi tiết dãy trọ
  const [dayChiTiet, setDayChiTiet] = useState(null);
  const [loadingChiTiet, setLoadingChiTiet] = useState(false);

  const hienThongBao = (type, text) => {
    setThongBao({ type, text });
    setTimeout(() => setThongBao({ type: '', text: '' }), 4000);
  };

  const taiDuLieu = useCallback(async (kw = '') => {
    setLoading(true);
    try {
      const res = await dayTroService.layDanhSach({ tuKhoa: kw });
      setDanhSach(res.data || []);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let huy = false;
    dayTroService
      .layDanhSach({ tuKhoa: '' })
      .then((res) => {
        if (!huy) setDanhSach(res.data || []);
      })
      .catch((err) => {
        if (!huy) hienThongBao('error', err.message);
      })
      .finally(() => {
        if (!huy) setLoading(false);
      });
    return () => {
      huy = true;
    };
  }, []);

  const handleTimKiem = (e) => {
    e.preventDefault();
    taiDuLieu(tuKhoa);
  };

  const moFormThemMoi = () => {
    setIdDangSua(null);
    setForm(FORM_MAC_DINH);
    setMoModalForm(true);
  };

  const moFormChinhSua = (day) => {
    setIdDangSua(day._id);
    const coords = day.viTri?.coordinates || [];
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
        ? prev.tienIchChung.filter((t) => t !== item)
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
      moTa: form.moTa.trim(),
      quyDinhChung: form.quyDinhChung.trim(),
      tienIchChung: form.tienIchChung,
    };

    if (form.lat !== '' && form.lng !== '') {
      payload.viTri = {
        type: 'Point',
        coordinates: [Number(form.lng), Number(form.lat)],
      };
    }

    try {
      if (idDangSua) {
        await dayTroService.capNhat(idDangSua, payload);
        hienThongBao('success', 'Cập nhật dãy trọ thành công!');
      } else {
        await dayTroService.taoMoi(payload);
        hienThongBao('success', 'Thêm dãy trọ mới thành công!');
      }
      setMoModalForm(false);
      taiDuLieu(tuKhoa);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const handleXoaDayTro = async (day) => {
    const xacNhan = window.confirm(
      `Bạn có chắc muốn xóa dãy trọ "${day.tenDayTro}"?\n(Hệ thống sẽ chặn xóa nếu dãy vẫn còn phòng bên trong)`
    );
    if (!xacNhan) return;

    try {
      await dayTroService.xoa(day._id);
      hienThongBao('success', `Đã xóa dãy trọ "${day.tenDayTro}".`);
      taiDuLieu(tuKhoa);
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  const handleXemChiTiet = async (day) => {
    setLoadingChiTiet(true);
    setDayChiTiet({ ...day, danhSachPhong: [] });
    try {
      const res = await dayTroService.layChiTiet(day._id);
      setDayChiTiet(res.data);
    } catch (err) {
      hienThongBao('error', err.message);
      setDayChiTiet(null);
    } finally {
      setLoadingChiTiet(false);
    }
  };

  return (
    <div className="day-tro-page">
      <div className="dt-header">
        <div>
          <h2 className="dt-title">Quản lý Dãy trọ</h2>
          <p className="dt-subtitle">Quản lý danh sách tòa nhà, khu trọ, địa chỉ và tiện ích chung</p>
        </div>
        <button className="dt-btn-primary" onClick={moFormThemMoi}>
          + Thêm dãy trọ mới
        </button>
      </div>

      {thongBao.text && <div className={`dt-alert ${thongBao.type}`}>{thongBao.text}</div>}

      <form className="dt-search-bar" onSubmit={handleTimKiem}>
        <input
          type="text"
          className="dt-search-input"
          placeholder="Tìm theo tên dãy trọ, đường, quận/huyện..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <button type="submit" className="dt-btn-secondary">
          Tìm kiếm
        </button>
        {tuKhoa && (
          <button
            type="button"
            className="dt-btn-secondary"
            onClick={() => {
              setTuKhoa('');
              taiDuLieu('');
            }}
          >
            Đặt lại
          </button>
        )}
      </form>

      {loading ? (
        <p className="dt-subtitle">Đang tải danh sách dãy trọ...</p>
      ) : danhSach.length === 0 ? (
        <div className="dt-empty">
          <p>Chưa có dãy trọ nào. Hãy tạo dãy trọ đầu tiên để bắt đầu quản lý phòng!</p>
          <button className="dt-btn-primary" onClick={moFormThemMoi}>
            + Tạo dãy trọ ngay
          </button>
        </div>
      ) : (
        <div className="dt-grid">
          {danhSach.map((day) => {
            const diaChiDayDu = [
              day.diaChi?.soNhaDuong,
              day.diaChi?.phuongXa,
              day.diaChi?.quanHuyen,
              day.diaChi?.tinhThanh,
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <div key={day._id} className="dt-card">
                <div>
                  <div className="dt-card-top">
                    <h3 className="dt-card-title">{day.tenDayTro}</h3>
                    <span className="dt-badge">{day.tongSoPhong ?? 0} phòng</span>
                  </div>
                  <p className="dt-address">📍 {diaChiDayDu || 'Chưa cập nhật địa chỉ'}</p>
                  {day.moTa && <p className="dt-desc">{day.moTa}</p>}
                  <div className="dt-tags">
                    {(day.tienIchChung || []).map((ti) => (
                      <span key={ti} className="dt-tag">
                        {ti}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="dt-card-actions">
                  <button className="dt-btn-sm info" onClick={() => handleXemChiTiet(day)}>
                    Chi tiết
                  </button>
                  <button className="dt-btn-sm" onClick={() => moFormChinhSua(day)}>
                    Sửa
                  </button>
                  <button className="dt-btn-sm danger" onClick={() => handleXoaDayTro(day)}>
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL THÊM / SỬA DÃY TRỌ */}
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
                  placeholder="VD: Khu trọ Hoa Sen - Cơ sở 1"
                />
              </div>

              <div className="dt-form-row">
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
                <div>
                  <label className="dt-label">Phường / Xã *</label>
                  <input
                    required
                    className="dt-input"
                    value={form.phuongXa}
                    onChange={(e) => setForm({ ...form, phuongXa: e.target.value })}
                    placeholder="VD: Quan Hoa"
                  />
                </div>
              </div>

              <div className="dt-form-row">
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
                <div>
                  <label className="dt-label">Tỉnh / Thành phố *</label>
                  <input
                    required
                    className="dt-input"
                    value={form.tinhThanh}
                    onChange={(e) => setForm({ ...form, tinhThanh: e.target.value })}
                    placeholder="VD: Hà Nội"
                  />
                </div>
              </div>

              <div className="dt-form-row">
                <div>
                  <label className="dt-label">Vĩ độ (Latitude - tùy chọn)</label>
                  <input
                    type="number"
                    step="any"
                    className="dt-input"
                    value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })}
                    placeholder="VD: 21.0333"
                  />
                </div>
                <div>
                  <label className="dt-label">Kinh độ (Longitude - tùy chọn)</label>
                  <input
                    type="number"
                    step="any"
                    className="dt-input"
                    value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })}
                    placeholder="VD: 105.7985"
                  />
                </div>
              </div>

              <div>
                <label className="dt-label">Tiện ích chung</label>
                <div className="dt-checkbox-group">
                  {TIEN_ICH_GOI_Y.map((item) => (
                    <label key={item} className="dt-checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.tienIchChung.includes(item)}
                        onChange={() => toggleTienIch(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="dt-label">Mô tả chung</label>
                <textarea
                  rows={2}
                  className="dt-input"
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  placeholder="Gần trường đại học, chợ, bến xe buýt..."
                />
              </div>

              <div>
                <label className="dt-label">Nội quy / Quy định chung</label>
                <textarea
                  rows={2}
                  className="dt-input"
                  value={form.quyDinhChung}
                  onChange={(e) => setForm({ ...form, quyDinhChung: e.target.value })}
                  placeholder="Không nuôi thú cưng, giữ trật tự sau 23h..."
                />
              </div>

              <div className="dt-modal-footer">
                <button type="button" className="dt-btn-secondary" onClick={() => setMoModalForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="dt-btn-primary" disabled={dangLuu}>
                  {dangLuu ? 'Đang lưu...' : idDangSua ? 'Lưu cập nhật' : 'Tạo dãy trọ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT DÃY TRỌ */}
      {dayChiTiet && (
        <div className="dt-modal-overlay">
          <div className="dt-modal">
            <div className="dt-modal-header">
              <h3 style={{ margin: 0 }}>{dayChiTiet.tenDayTro}</h3>
              <button className="dt-close-btn" onClick={() => setDayChiTiet(null)}>
                ✕
              </button>
            </div>
            {loadingChiTiet ? (
              <p>Đang tải chi tiết dãy trọ...</p>
            ) : (
              <div>
                <p className="dt-address">
                  <strong>Địa chỉ:</strong>{' '}
                  {[
                    dayChiTiet.diaChi?.soNhaDuong,
                    dayChiTiet.diaChi?.phuongXa,
                    dayChiTiet.diaChi?.quanHuyen,
                    dayChiTiet.diaChi?.tinhThanh,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {dayChiTiet.quyDinhChung && (
                  <p className="dt-desc">
                    <strong>Nội quy:</strong> {dayChiTiet.quyDinhChung}
                  </p>
                )}
                <h4>Danh sách phòng thuộc dãy ({dayChiTiet.danhSachPhong?.length || 0} phòng)</h4>
                {!dayChiTiet.danhSachPhong || dayChiTiet.danhSachPhong.length === 0 ? (
                  <p className="dt-subtitle">Dãy trọ này chưa có phòng nào.</p>
                ) : (
                  <div className="dt-room-mini-list">
                    {dayChiTiet.danhSachPhong.map((p) => (
                      <div key={p._id} className="dt-room-mini-item">
                        <span>
                          <strong>{p.soPhong}</strong> (Tầng {p.tang}) — {p.giaThue?.toLocaleString('vi-VN')} đ/tháng
                        </span>
                        <span className="dt-badge">{p.trangThai}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}