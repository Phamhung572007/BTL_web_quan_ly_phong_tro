import React, { useEffect, useState } from 'react';
import tinDangService from '../../services/tinDangService';
import phongTroService from '../../services/phongTroService';
import './DangTin.css';

const FORM_MAC_DINH = {
  phongTroId: '',
  tieuDe: '',
  moTaChiTiet: '',
  giaChoThue: '',
  dienTich: '',
  soDienThoaiLienHe: '',
  hinhAnh: [],
};

export default function DangTin() {
  const [danhSachTin, setDanhSachTin] = useState([]);
  const [danhSachPhongTrong, setDanhSachPhongTrong] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thongBao, setThongBao] = useState({ type: '', text: '' });

  // Modal Tạo / Sửa tin
  const [moModalForm, setMoModalForm] = useState(false);
  const [idDangSua, setIdDangSua] = useState(null);
  const [form, setForm] = useState(FORM_MAC_DINH);
  const [urlAnhNhapTay, setUrlAnhNhapTay] = useState('');
  const [dangUpload, setDangUpload] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);

  const hienThongBao = (type, text) => {
    setThongBao({ type, text });
    setTimeout(() => setThongBao({ type: '', text: '' }), 4000);
  };

  const taiDuLieu = async () => {
    setLoading(true);
    try {
      const nguoiDung = JSON.parse(localStorage.getItem('user') || 'null');
      const [resTin, resPhongTrong] = await Promise.all([
        tinDangService.timKiemTinDang({
          ...(nguoiDung?._id ? { chuTroId: nguoiDung._id } : {}),
          limit: 50,
        }),
        phongTroService.layPhongTrong({ limit: 100 }),
      ]);
      setDanhSachTin(resTin.data || []);
      setDanhSachPhongTrong(resPhongTrong.data || []);
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  const moFormTaoTin = () => {
    if (danhSachPhongTrong.length === 0) {
      hienThongBao('error', 'Bạn chưa có phòng trống nào để tạo tin cho thuê!');
      return;
    }
    const phongDau = danhSachPhongTrong[0];
    setIdDangSua(null);
    setForm({
      phongTroId: phongDau._id,
      tieuDe: `Cho thuê phòng ${phongDau.soPhong} - ${phongDau.dayTroId?.tenDayTro || ''}`,
      moTaChiTiet: phongDau.moTa || '',
      giaChoThue: phongDau.giaThue ?? '',
      dienTich: phongDau.dienTich ?? '',
      soDienThoaiLienHe: '',
      hinhAnh: phongDau.hinhAnh?.length ? [...phongDau.hinhAnh] : [],
    });
    setMoModalForm(true);
  };

  const moFormSuaTin = (tin) => {
    setIdDangSua(tin._id);
    setForm({
      phongTroId: tin.phongTroId?._id || tin.phongTroId || '',
      tieuDe: tin.tieuDe || '',
      moTaChiTiet: tin.moTaChiTiet || '',
      giaChoThue: tin.giaChoThue ?? '',
      dienTich: tin.dienTich ?? '',
      soDienThoaiLienHe: tin.soDienThoaiLienHe || '',
      hinhAnh: tin.hinhAnh || [],
    });
    setMoModalForm(true);
  };

  const handleChonPhong = (phongId) => {
    const phong = danhSachPhongTrong.find((p) => p._id === phongId);
    setForm((prev) => ({
      ...prev,
      phongTroId: phongId,
      giaChoThue: phong ? phong.giaThue : prev.giaChoThue,
      dienTich: phong ? phong.dienTich : prev.dienTich,
    }));
  };

  const handleUploadFileAnh = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setDangUpload(true);
    try {
      const res = await tinDangService.uploadAnh(files);
      const urls = Array.isArray(res.data)
        ? res.data.map((item) => (typeof item === 'string' ? item : item.url))
        : res.data?.urls || [];
      setForm((prev) => ({ ...prev, hinhAnh: [...prev.hinhAnh, ...urls] }));
      hienThongBao('success', 'Tải ảnh lên thành công!');
    } catch (err) {
      hienThongBao('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setDangUpload(false);
      e.target.value = '';
    }
  };

  const handleThemUrlAnh = () => {
    const url = urlAnhNhapTay.trim();
    if (!url) return;
    setForm((prev) => ({ ...prev, hinhAnh: [...prev.hinhAnh, url] }));
    setUrlAnhNhapTay('');
  };

  const handleXoaAnh = (index) => {
    setForm((prev) => ({
      ...prev,
      hinhAnh: prev.hinhAnh.filter((_, idx) => idx !== index),
    }));
  };

  const handleLuuTinDang = async (e) => {
    e.preventDefault();
    if (form.hinhAnh.length === 0) {
      hienThongBao('error', 'Vui lòng tải lên hoặc thêm ít nhất 1 hình ảnh phòng.');
      return;
    }

    setDangLuu(true);
    const payload = {
      phongTroId: form.phongTroId,
      tieuDe: form.tieuDe.trim(),
      moTaChiTiet: form.moTaChiTiet.trim(),
      giaChoThue: Number(form.giaChoThue),
      dienTich: Number(form.dienTich),
      soDienThoaiLienHe: form.soDienThoaiLienHe.trim(),
      hinhAnh: form.hinhAnh,
    };

    try {
      if (idDangSua) {
        await tinDangService.capNhat(idDangSua, payload);
        hienThongBao('success', 'Cập nhật tin đăng thành công!');
      } else {
        await tinDangService.taoMoi(payload);
        hienThongBao('success', 'Đăng tin cho thuê thành công!');
      }
      setMoModalForm(false);
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const handleDoiTrangThaiTin = async (tin) => {
    const trangThaiMoi = tin.trangThai === 'DANG_HIEN_THI' ? 'DA_AN' : 'DANG_HIEN_THI';
    try {
      await tinDangService.doiTrangThai(tin._id, trangThaiMoi);
      hienThongBao(
        'success',
        trangThaiMoi === 'DANG_HIEN_THI'
          ? 'Tin đăng đã được hiển thị công khai.'
          : 'Đã ẩn tin khỏi danh sách tìm kiếm công khai.'
      );
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  const handleXoaTin = async (tin) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa tin "${tin.tieuDe}"?`)) return;
    try {
      await tinDangService.xoa(tin._id);
      hienThongBao('success', 'Đã xóa tin đăng.');
      taiDuLieu();
    } catch (err) {
      hienThongBao('error', err.message);
    }
  };

  return (
    <div className="dang-tin-page">
      <div className="td-header">
        <div>
          <h2 className="td-title">Quản lý Tin đăng cho thuê</h2>
          <p className="td-subtitle">
            Tạo bài đăng quảng bá phòng trống, cập nhật hình ảnh và bật/tắt hiển thị trên trang tìm phòng
          </p>
        </div>
        <button className="td-btn-primary" onClick={moFormTaoTin}>
          + Đăng tin cho thuê mới
        </button>
      </div>

      {thongBao.text && <div className={`td-alert ${thongBao.type}`}>{thongBao.text}</div>}

      {loading ? (
        <p className="td-subtitle">Đang tải danh sách tin đăng...</p>
      ) : danhSachTin.length === 0 ? (
        <div className="td-empty">
          <p>Bạn chưa có tin đăng cho thuê nào.</p>
          <button className="td-btn-primary" onClick={moFormTaoTin}>
            Tạo tin đăng đầu tiên
          </button>
        </div>
      ) : (
        <div className="td-grid">
          {danhSachTin.map((tin) => (
            <div key={tin._id} className="td-card">
              <div>
                <div className="td-cover">
                  <img
                    src={
                      tin.hinhAnh?.[0] ||
                      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'
                    }
                    alt={tin.tieuDe}
                  />
                  <span className={`td-status-pill ${tin.trangThai}`}>
                    {tin.trangThai === 'DANG_HIEN_THI' ? 'Đang hiển thị' : 'Đã ẩn'}
                  </span>
                </div>

                <div className="td-card-body">
                  <h3 className="td-card-title">{tin.tieuDe}</h3>
                  <div className="td-card-price">
                    {tin.giaChoThue?.toLocaleString('vi-VN')} đ/tháng • {tin.dienTich} m²
                  </div>
                  <div className="td-card-meta">
                    🏠 Phòng: <strong>{tin.phongTroId?.soPhong || '-'}</strong> (
                    {tin.dayTroId?.tenDayTro || 'Dãy trọ'})
                  </div>
                  <div className="td-card-meta">
                    📞 Liên hệ: {tin.soDienThoaiLienHe} • 👁 {tin.luotXem || 0} lượt xem
                  </div>
                </div>
              </div>

              <div className="td-card-footer">
                <button className="td-btn-sm toggle" onClick={() => handleDoiTrangThaiTin(tin)}>
                  {tin.trangThai === 'DANG_HIEN_THI' ? 'Ẩn tin' : 'Đăng lại'}
                </button>
                <button className="td-btn-sm" onClick={() => moFormSuaTin(tin)}>
                  Sửa
                </button>
                <button className="td-btn-sm danger" onClick={() => handleXoaTin(tin)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO / SỬA TIN ĐĂNG */}
      {moModalForm && (
        <div className="td-modal-overlay">
          <div className="td-modal">
            <div className="td-modal-header">
              <h3 style={{ margin: 0 }}>{idDangSua ? 'Cập nhật tin cho thuê' : 'Tạo tin cho thuê mới'}</h3>
              <button className="td-close-btn" onClick={() => setMoModalForm(false)}>
                ✕
              </button>
            </div>
            <form className="td-form" onSubmit={handleLuuTinDang}>
              <div>
                <label className="td-label">Chọn phòng trống muốn đăng tin *</label>
                <select
                  required
                  disabled={Boolean(idDangSua)}
                  className="td-input"
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
                <label className="td-label">Tiêu đề tin đăng *</label>
                <input
                  required
                  maxLength={150}
                  className="td-input"
                  value={form.tieuDe}
                  onChange={(e) => setForm({ ...form, tieuDe: e.target.value })}
                  placeholder="VD: Cho thuê phòng trọ khép kín Cầu Giấy, full điều hòa nóng lạnh"
                />
              </div>

              <div className="td-form-row">
                <div>
                  <label className="td-label">Giá cho thuê (VNĐ/tháng) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="td-input"
                    value={form.giaChoThue}
                    onChange={(e) => setForm({ ...form, giaChoThue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="td-label">Diện tích (m²) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="td-input"
                    value={form.dienTich}
                    onChange={(e) => setForm({ ...form, dienTich: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="td-label">Số điện thoại liên hệ *</label>
                <input
                  required
                  className="td-input"
                  value={form.soDienThoaiLienHe}
                  onChange={(e) => setForm({ ...form, soDienThoaiLienHe: e.target.value })}
                  placeholder="VD: 0987654321"
                />
              </div>

              <div>
                <label className="td-label">Mô tả chi tiết *</label>
                <textarea
                  required
                  rows={4}
                  className="td-input"
                  value={form.moTaChiTiet}
                  onChange={(e) => setForm({ ...form, moTaChiTiet: e.target.value })}
                  placeholder="Mô tả vị trí, tiện ích xung quanh, giá điện nước, nội thất..."
                />
              </div>

              <div>
                <label className="td-label">Hình ảnh phòng trọ *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={dangUpload}
                  onChange={handleUploadFileAnh}
                />
                {dangUpload && <span style={{ fontSize: '12px', color: '#2563eb' }}> Đang tải ảnh lên...</span>}

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="url"
                    className="td-input"
                    value={urlAnhNhapTay}
                    onChange={(e) => setUrlAnhNhapTay(e.target.value)}
                    placeholder="Hoặc dán đường dẫn URL ảnh..."
                  />
                  <button type="button" className="td-btn-outline" onClick={handleThemUrlAnh}>
                    Thêm URL
                  </button>
                </div>

                {form.hinhAnh.length > 0 && (
                  <div className="td-image-preview-list">
                    {form.hinhAnh.map((url, idx) => (
                      <div key={`${url}-${idx}`} className="td-image-thumb">
                        <img src={url} alt={`Ảnh ${idx + 1}`} />
                        <button
                          type="button"
                          className="td-remove-img"
                          onClick={() => handleXoaAnh(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="td-modal-footer">
                <button type="button" className="td-btn-outline" onClick={() => setMoModalForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="td-btn-primary" disabled={dangLuu || dangUpload}>
                  {dangLuu ? 'Đang lưu...' : idDangSua ? 'Lưu cập nhật' : 'Đăng tin ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}