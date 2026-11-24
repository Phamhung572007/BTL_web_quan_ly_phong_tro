import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const taiDuLieu = useCallback(async () => {
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
  }, [locDayTro, locTrangThai, tuKhoa]);

  useEffect(() => {
    let huy = false;
    Promise.all([
      dayTroService.layDanhSach({ limit: 100 }),
      phongTroService.layDanhSach({
        dayTroId: locDayTro,
        trangThai: locTrangThai,
        tuKhoa: '',
      }),
    ])
      .then(([resDay, resPhong]) => {
        if (!huy) {
          setDanhSachDay(resDay.data || []);
          setDanhSachPhong(resPhong.data || []);
        }
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
  }, [locDayTro, locTrangThai]);

  // Thống kê nhanh số phòng theo trạng thái
  const thongKe = useMemo(() => {
    return danhSachPhong.reduce(
      (acc, p) => {
        acc.tong += 1;
        if (p.trangThai === 'TRONG') acc.trong += 1;
        else if (p.trangThai === 'DANG_O') acc.dangO += 1;
        else if (p.trangThai === 'BAO_TRI') acc.baoTri += 1;
        return acc;
      },
      { tong: 0, trong: 0, dangO: 0, baoTri: 0 }
    );
  }, [danhSachPhong]);

  // Nhóm phòng theo từng tầng cho Sơ đồ trực quan
  const phongTheoTang = useMemo(() => {
    const map = {};
    danhSachPhong.forEach((p) => {
      const tang = p.tang || 1;
      if (!map[tang]) map[tang] = [];
      map[tang].push(p);
    });
    return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [danhSachPhong]);

  const moFormThemMoi = () => {
    if (danhSachDay.length === 0) {
      hienThongBao('error', 'Bạn cần tạo ít nhất một Dãy trọ trước khi thêm Phòng!');
      return;
    }
    setIdDangSua(null);
    setForm({
      ...FORM_MAC_DINH,
      dayTroId: locDayTro || danhSachDay[0]._id,
    });
    setMoModalForm(true);
  };

  const moFormChinhSua = (phong) => {
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
        ? prev.noiThat.filter((nt) => nt !== item)
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
      moTa: form.moTa.trim(),
    };

    try {
      if (idDangSua) {
        await phongTroService.capNhat(idDangSua, payload);
        hienThongBao('success', `Cập nhật ${payload.soPhong} thành công!`);
      } else {
        await phongTroService.taoMoi(payload);
        hienThongBao('success', `Thêm ${payload.soPhong} thành công!`);
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
    const xacNhan = window.confirm(
      `Bạn chắc chắn muốn xóa "${phong.soPhong}"?\n(Hệ thống sẽ chặn xóa nếu phòng đang có người ở hoặc hợp đồng hiệu lực)`
    );
    if (!xacNhan) return;

    try {
      await phongTroService.xoa(phong._id);
      hienThongBao('success', `Đã xóa ${phong.soPhong}.`);
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
          <p className="pt-subtitle">Theo dõi trạng thái phòng theo sơ đồ tầng, giá thuê và nội thất</p>
        </div>
        <button className="pt-btn-primary" onClick={moFormThemMoi}>
          + Thêm phòng mới
        </button>
      </div>

      {thongBao.text && <div className={`pt-alert ${thongBao.type}`}>{thongBao.text}</div>}

      {/* Thống kê nhanh */}
      <div className="pt-stats">
        <div className="pt-stat-card">
          <div className="pt-stat-label">Tổng số phòng</div>
          <div className="pt-stat-value">{thongKe.tong}</div>
        </div>
        <div className="pt-stat-card">
          <div className="pt-stat-label">Phòng trống</div>
          <div className="pt-stat-value trong">{thongKe.trong}</div>
        </div>
        <div className="pt-stat-card">
          <div className="pt-stat-label">Đang có người ở</div>
          <div className="pt-stat-value dang-o">{thongKe.dangO}</div>
        </div>
        <div className="pt-stat-card">
          <div className="pt-stat-label">Đang bảo trì</div>
          <div className="pt-stat-value bao-tri">{thongKe.baoTri}</div>
        </div>
      </div>

      {/* Thanh lọc & chuyển chế độ xem */}
      <div className="pt-toolbar">
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
          style={{ maxWidth: '220px' }}
          placeholder="Tìm số phòng (VD: P101)..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />
        <button type="button" className="pt-btn-outline" onClick={taiDuLieu}>
          Lọc
        </button>

        <div className="pt-view-switch">
          <button
            type="button"
            className={`pt-btn-outline ${cheDoXem === 'SO_DO' ? 'active' : ''}`}
            onClick={() => setCheDoXem('SO_DO')}
          >
            Sơ đồ tầng
          </button>
          <button
            type="button"
            className={`pt-btn-outline ${cheDoXem === 'DANH_SACH' ? 'active' : ''}`}
            onClick={() => setCheDoXem('DANH_SACH')}
          >
            Bảng danh sách
          </button>
        </div>
      </div>

      {loading ? (
        <p className="pt-subtitle">Đang tải dữ liệu phòng trọ...</p>
      ) : danhSachPhong.length === 0 ? (
        <p className="pt-subtitle">Không tìm thấy phòng trọ nào phù hợp bộ lọc.</p>
      ) : cheDoXem === 'SO_DO' ? (
        /* CHẾ ĐỘ SƠ ĐỒ TẦNG */
        <div>
          {phongTheoTang.map(([tang, phongs]) => (
            <div key={tang} className="pt-floor-section">
              <div className="pt-floor-header">
                <span>🏢 Tầng {tang}</span>
                <span>{phongs.length} phòng</span>
              </div>
              <div className="pt-room-grid">
                {phongs.map((p) => (
                  <div key={p._id} className={`pt-room-card ${p.trangThai}`}>
                    <div>
                      <div className="pt-room-top">
                        <span className="pt-room-name">{p.soPhong}</span>
                        <span className={`pt-status-badge ${p.trangThai}`}>
                          {TRANG_THAI_LABEL[p.trangThai]}
                        </span>
                      </div>
                      <div className="pt-room-info">🏠 {p.dayTroId?.tenDayTro || 'Dãy trọ'}</div>
                      <div className="pt-room-info">
                        💰 <strong>{p.giaThue?.toLocaleString('vi-VN')} đ</strong>/tháng
                      </div>
                      <div className="pt-room-info">
                        📐 {p.dienTich} m² • 👥 Tối đa {p.soNguoiToiDa} người
                      </div>
                    </div>

                    <div className="pt-room-actions">
                      <button className="pt-btn-sm info" onClick={() => handleXemChiTiet(p)}>
                        Chi tiết
                      </button>
                      <button className="pt-btn-sm" onClick={() => moFormChinhSua(p)}>
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
        /* CHẾ ĐỘ BẢNG DANH SÁCH */
        <div className="pt-table-wrap">
          <table className="pt-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Dãy trọ</th>
                <th>Tầng</th>
                <th>Giá thuê</th>
                <th>Diện tích</th>
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
                  <td>{p.giaThue?.toLocaleString('vi-VN')} đ</td>
                  <td>{p.dienTich} m²</td>
                  <td>
                    <span className={`pt-status-badge ${p.trangThai}`}>
                      {TRANG_THAI_LABEL[p.trangThai]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="pt-btn-sm info" onClick={() => handleXemChiTiet(p)}>
                        Chi tiết
                      </button>
                      <button className="pt-btn-sm" onClick={() => moFormChinhSua(p)}>
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
              <h3 style={{ margin: 0 }}>{idDangSua ? `Cập nhật ${form.soPhong}` : 'Thêm phòng trọ mới'}</h3>
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
                  className="pt-input"
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
                    className="pt-input"
                    value={form.soPhong}
                    onChange={(e) => setForm({ ...form, soPhong: e.target.value })}
                    placeholder="VD: P101"
                  />
                </div>
                <div>
                  <label className="pt-label">Tầng *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="pt-input"
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
                    className="pt-input"
                    value={form.giaThue}
                    onChange={(e) => setForm({ ...form, giaThue: e.target.value })}
                    placeholder="VD: 3500000"
                  />
                </div>
                <div>
                  <label className="pt-label">Tiền cọc mặc định (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    className="pt-input"
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
                    className="pt-input"
                    value={form.dienTich}
                    onChange={(e) => setForm({ ...form, dienTich: e.target.value })}
                    placeholder="VD: 25"
                  />
                </div>
                <div>
                  <label className="pt-label">Số người ở tối đa</label>
                  <input
                    type="number"
                    min="1"
                    className="pt-input"
                    value={form.soNguoiToiDa}
                    onChange={(e) => setForm({ ...form, soNguoiToiDa: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="pt-label">Trạng thái phòng</label>
                <select
                  className="pt-input"
                  value={form.trangThai}
                  onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
                >
                  <option value="TRONG">Trống</option>
                  <option value="DANG_O">Đang ở</option>
                  <option value="BAO_TRI">Bảo trì</option>
                </select>
              </div>

              <div>
                <label className="pt-label">Nội thất trang bị sẵn</label>
                <div className="pt-checkbox-group">
                  {NOI_THAT_GOI_Y.map((item) => (
                    <label key={item} className="pt-checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.noiThat.includes(item)}
                        onChange={() => toggleNoiThat(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="pt-label">Mô tả phòng</label>
                <textarea
                  rows={2}
                  className="pt-input"
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  placeholder="Phòng thoáng mát, có cửa sổ giếng trời..."
                />
              </div>

              <div className="pt-modal-footer">
                <button type="button" className="pt-btn-outline" onClick={() => setMoModalForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="pt-btn-primary" disabled={dangLuu}>
                  {dangLuu ? 'Đang lưu...' : idDangSua ? 'Lưu cập nhật' : 'Thêm phòng'}
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
                Chi tiết {phongChiTiet.soPhong} — {phongChiTiet.dayTroId?.tenDayTro}
              </h3>
              <button className="pt-close-btn" onClick={() => setPhongChiTiet(null)}>
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div>
                <strong>Trạng thái:</strong> {TRANG_THAI_LABEL[phongChiTiet.trangThai]}
              </div>
              <div>
                <strong>Vị trí:</strong> Tầng {phongChiTiet.tang} • Diện tích {phongChiTiet.dienTich} m²
              </div>
              <div>
                <strong>Giá thuê:</strong> {phongChiTiet.giaThue?.toLocaleString('vi-VN')} đ/tháng •{' '}
                <strong>Tiền cọc:</strong> {phongChiTiet.tienCocMacDinh?.toLocaleString('vi-VN')} đ
              </div>
              <div>
                <strong>Nội thất:</strong>{' '}
                {phongChiTiet.noiThat?.length ? phongChiTiet.noiThat.join(', ') : 'Phòng trống cơ bản'}
              </div>
              {phongChiTiet.hopDongHienTai && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                  }}
                >
                  <strong>Hợp đồng đang hiệu lực:</strong>
                  <div>Người thuê: {phongChiTiet.hopDongHienTai.nguoiThueId?.hoTen || 'Đang cập nhật'}</div>
                  <div>SĐT: {phongChiTiet.hopDongHienTai.nguoiThueId?.soDienThoai || '-'}</div>
                  <div>
                    Thời hạn: {new Date(phongChiTiet.hopDongHienTai.ngayBatDau).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(phongChiTiet.hopDongHienTai.ngayKetThuc).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}