import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, KeyRound, LogOut, RotateCcw, Save, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  layThongTinTaiKhoanApi,
  capNhatTaiKhoanApi,
  doiMatKhauApi,
} from '../../services/tai_khoan_service.js';
import { uploadNhieuAnhApi, layUrlAnh } from '../../services/upload_service.js';
import { Notice, PageHeader, SavingLabel, Status } from '../../components/WorkspaceUI.jsx';
import { errorMessage, formatDate } from '../../utils/format.js';
import './TaiKhoan.css';

const ROLE_LABELS = {
  CHU_TRO: 'Chủ nhà trọ',
  KHACH_THUE: 'Khách thuê trọ',
  ADMIN: 'Quản trị viên',
  QUAN_TRI: 'Quản trị viên',
};

export default function TaiKhoan() {
  const navigate = useNavigate();
  const { user, setSession, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Dữ liệu hồ sơ từ server
  const [hoSo, setHoSo] = useState(null);
  const [dangTai, setDangTai] = useState(true);

  // Form cập nhật thông tin cá nhân
  const [formInfo, setFormInfo] = useState({
    hoTen: '',
    soDienThoai: '',
    anhDaiDien: '',
  });
  const [dangLuuInfo, setDangLuuInfo] = useState(false);
  const [dangUploadAnh, setDangUploadAnh] = useState(false);

  // Form đổi mật khẩu
  const [formPass, setFormPass] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhau: '',
  });
  const [dangDoiPass, setDangDoiPass] = useState(false);

  // Thông báo phản hồi
  const [loi, setLoi] = useState('');
  const [thanhCong, setThanhCong] = useState('');

  // Tải thông tin tài khoản hiện tại
  async function taiHoSo() {
    setDangTai(true);
    setLoi('');
    try {
      const res = await layThongTinTaiKhoanApi();
      const duLieu = res.data?.nguoiDung || res.data || user || {};
      setHoSo(duLieu);
      setFormInfo({
        hoTen: duLieu.hoTen || '',
        soDienThoai: duLieu.soDienThoai || '',
        anhDaiDien: duLieu.anhDaiDien || '',
      });
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể tải thông tin tài khoản.'));
    } finally {
      setDangTai(false);
    }
  }

  useEffect(() => {
    taiHoSo();
  }, []);

  // Upload ảnh đại diện mới
  async function xuLyChonAnh(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDangUploadAnh(true);
    setLoi('');
    setThanhCong('');
    try {
      const res = await uploadNhieuAnhApi(files);
      const danhSachUrl = res.data?.urls || res.data || [];
      const urlMoi = Array.isArray(danhSachUrl) ? danhSachUrl[0] : danhSachUrl;
      if (urlMoi) {
        setFormInfo((prev) => ({ ...prev, anhDaiDien: urlMoi }));
        setThanhCong('Đã tải ảnh đại diện lên. Bấm "Lưu thông tin" để hoàn tất.');
      }
    } catch (err) {
      setLoi(errorMessage(err, 'Tải ảnh đại diện thất bại.'));
    } finally {
      setDangUploadAnh(false);
      e.target.value = '';
    }
  }

  // Lưu thông tin cá nhân
  async function xuLyLuuThongTin(e) {
    e.preventDefault();
    if (!formInfo.hoTen.trim()) {
      setLoi('Vui lòng nhập họ và tên.');
      return;
    }

    setDangLuuInfo(true);
    setLoi('');
    setThanhCong('');
    try {
      const res = await capNhatTaiKhoanApi({
        hoTen: formInfo.hoTen.trim(),
        soDienThoai: formInfo.soDienThoai.trim(),
        anhDaiDien: formInfo.anhDaiDien,
      });
      const duLieuMoi = res.data?.nguoiDung || res.data || { ...hoSo, ...formInfo };
      setHoSo(duLieuMoi);
      if (setSession) {
        await setSession({ data: { nguoiDung: duLieuMoi } });
      }
      setThanhCong(res.message || 'Đã cập nhật thông tin tài khoản.');
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể cập nhật thông tin tài khoản.'));
    } finally {
      setDangLuuInfo(false);
    }
  }

  // Đổi mật khẩu
  async function xuLyDoiMatKhau(e) {
    e.preventDefault();
    if (!formPass.matKhauCu || !formPass.matKhauMoi) {
      setLoi('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }
    if (formPass.matKhauMoi.length < 6) {
      setLoi('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (formPass.matKhauMoi !== formPass.xacNhanMatKhau) {
      setLoi('Mật khẩu xác nhận không khớp.');
      return;
    }

    setDangDoiPass(true);
    setLoi('');
    setThanhCong('');
    try {
      const res = await doiMatKhauApi({
        matKhauCu: formPass.matKhauCu,
        matKhauMoi: formPass.matKhauMoi,
      });
      setFormPass({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
      setThanhCong(res.message || 'Đổi mật khẩu thành công.');
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.'));
    } finally {
      setDangDoiPass(false);
    }
  }

  // Đăng xuất khỏi hệ thống
  function xuLyDangXuat() {
    logout();
    navigate('/dang-nhap', { replace: true });
  }

  const tenHienTai = hoSo?.hoTen || user?.hoTen || 'Người dùng';
  const chuCaiDau = Array.from(tenHienTai.trim())[0]?.toLocaleUpperCase('vi-VN') || 'U';
  const avatarUrl = layUrlAnh(formInfo.anhDaiDien || hoSo?.anhDaiDien);

  return (
    <section className="page">
      <PageHeader
        title="Hồ sơ tài khoản"
        description="Quản lý thông tin cá nhân, ảnh đại diện và bảo mật mật khẩu đăng nhập."
        actions={
          <>
            <button type="button" className="button" onClick={taiHoSo} disabled={dangTai}>
              <RotateCcw size={14} /> Tải lại
            </button>
            <button type="button" className="button button--warm" onClick={xuLyDangXuat}>
              <LogOut size={14} /> Đăng xuất
            </button>
          </>
        }
      />

      {loi && <Notice onClose={() => setLoi('')}>{loi}</Notice>}
      {thanhCong && (
        <Notice tone="success" onClose={() => setThanhCong('')}>
          {thanhCong}
        </Notice>
      )}

      <div className="tk-grid">
        {/* Cột trái: Thẻ tóm tắt tài khoản */}
        <aside className="panel tk-profile-card">
          <div className="tk-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={tenHienTai} className="tk-avatar-img" />
            ) : (
              <div className="tk-avatar-fallback">{chuCaiDau}</div>
            )}
            <button
              type="button"
              className="tk-avatar-upload-btn"
              title="Đổi ảnh đại diện"
              disabled={dangUploadAnh}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={xuLyChonAnh}
            />
          </div>

          <h2 className="tk-profile-name">{tenHienTai}</h2>
          <p className="tk-profile-email">{hoSo?.email || user?.email}</p>

          <div className="tk-badges">
            <span className="tk-role-pill">
              {ROLE_LABELS[hoSo?.vaiTro || user?.vaiTro] || 'Thành viên'}
            </span>
            <Status value={hoSo?.trangThai || 'HOAT_DONG'} />
          </div>

          <div className="tk-meta-list">
            <div className="tk-meta-item">
              <span>Số điện thoại</span>
              <strong>{hoSo?.soDienThoai || 'Chưa cập nhật'}</strong>
            </div>
            <div className="tk-meta-item">
              <span>Ngày tham gia</span>
              <strong>{hoSo?.createdAt ? formatDate(hoSo.createdAt) : '—'}</strong>
            </div>
          </div>
        </aside>

        {/* Cột phải: Cập nhật thông tin & Đổi mật khẩu */}
        <div className="tk-stack">
          <section className="panel">
            <div className="panel__heading">
              <div>
                <h2>Thông tin cá nhân</h2>
                <p>Cập nhật họ tên, số điện thoại liên hệ và ảnh đại diện hiển thị.</p>
              </div>
              <UserCheck size={17} color="#2563d9" />
            </div>

            <form className="panel__body" onSubmit={xuLyLuuThongTin}>
              <div className="form-grid form-grid--two">
                <label className="field-label">
                  Họ và tên
                  <input
                    className="field"
                    type="text"
                    required
                    value={formInfo.hoTen}
                    onChange={(e) => setFormInfo((p) => ({ ...p, hoTen: e.target.value }))}
                  />
                </label>

                <label className="field-label">
                  Số điện thoại
                  <input
                    className="field"
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={formInfo.soDienThoai}
                    onChange={(e) => setFormInfo((p) => ({ ...p, soDienThoai: e.target.value }))}
                  />
                </label>

                <label className="field-label form-span-two">
                  Email đăng nhập (không thể thay đổi)
                  <input
                    className="field"
                    type="email"
                    disabled
                    value={hoSo?.email || user?.email || ''}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={dangLuuInfo || dangUploadAnh}
                >
                  <Save size={14} /> Lưu thông tin
                </button>
                <SavingLabel active={dangLuuInfo || dangUploadAnh} />
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="panel__heading">
              <div>
                <h2>Đổi mật khẩu</h2>
                <p>Sử dụng mật khẩu tối thiểu 6 ký tự để bảo vệ tài khoản.</p>
              </div>
              <KeyRound size={17} color="#2563d9" />
            </div>

            <form className="panel__body" onSubmit={xuLyDoiMatKhau}>
              <div className="form-grid form-grid--two">
                <label className="field-label form-span-two">
                  Mật khẩu hiện tại
                  <input
                    className="field"
                    type="password"
                    required
                    value={formPass.matKhauCu}
                    onChange={(e) => setFormPass((p) => ({ ...p, matKhauCu: e.target.value }))}
                  />
                </label>

                <label className="field-label">
                  Mật khẩu mới
                  <input
                    className="field"
                    type="password"
                    required
                    minLength={6}
                    value={formPass.matKhauMoi}
                    onChange={(e) => setFormPass((p) => ({ ...p, matKhauMoi: e.target.value }))}
                  />
                </label>

                <label className="field-label">
                  Xác nhận mật khẩu mới
                  <input
                    className="field"
                    type="password"
                    required
                    minLength={6}
                    value={formPass.xacNhanMatKhau}
                    onChange={(e) =>
                      setFormPass((p) => ({ ...p, xacNhanMatKhau: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="button button--primary" disabled={dangDoiPass}>
                  <KeyRound size={14} /> Cập nhật mật khẩu
                </button>
                <SavingLabel active={dangDoiPass} children="Đang cập nhật..." />
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>
  );
}