import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { dangNhapApi, dangKyApi } from '../../services/tai_khoan_service.js';

import logoNgoiNha from '../../assets/icons/logo-ngoi-nha.svg';
import iconEmail from '../../assets/icons/icon-email.svg';
import iconKhoa from '../../assets/icons/icon-khoa.svg';
import iconAnMatKhau from '../../assets/icons/icon-an-mat-khau.svg';
import iconMuiTen from '../../assets/icons/icon-mui-ten.svg';

import './DangNhap.css';

function xacDinhTrangDich(vaiTro, fromState) {
  if (vaiTro === 'CHU_TRO' || vaiTro === 'ADMIN') {
    return '/thong-ke';
  }

  const duongDanTuState =
    typeof fromState === 'string'
      ? fromState
      : fromState?.pathname
        ? `${fromState.pathname}${fromState.search || ''}`
        : '';

  if (duongDanTuState && duongDanTuState.startsWith('/khach-thue')) {
    return duongDanTuState;
  }

  return '/khach-thue/tim-phong';
}

export default function DangNhap() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, authStatus, setSession } = useAuth();

  // điều khiển giao diện & trạng thái gửi form
  const [laDangKy, setLaDangKy] = useState(false); // false: đăng nhập, true: đăng ký
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [dangGui, setDangGui] = useState(false); // khóa nút submit khi đang gọi API
  const [loi, setLoi] = useState(''); // lưu thông báo lỗi hiển thị lên form

  // lưu dữ liệu ô nhập liệu
  const [form, setForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    xacNhanMatKhau: '',
    vaiTro: 'KHACH_THUE',
  });

  // tự động điều hướng nếu người dùng đã đăng nhập từ trước
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      const trangDich = xacDinhTrangDich(user.vaiTro, location.state?.from);
      navigate(trangDich, { replace: true });
    }
  }, [authStatus, user, navigate, location]);

  // cập nhật giá trị khi nhập liệu và xóa thông báo lỗi cũ
  const xuLyThayDoi = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (loi) setLoi('');
  };

  // chuyển đổi qua lại giữa tab Đăng nhập và Đăng ký
  const chuyenCheDo = () => {
    setLaDangKy((prev) => !prev);
    setLoi('');
    setHienMatKhau(false);
  };

  // kiểm tra tính hợp lệ của dữ liệu trước khi gửi lên BE
  const kiemTraHopLe = () => {
    if (!form.email.trim()) return 'Vui lòng nhập email.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Email không đúng định dạng.';
    if (!form.matKhau) return 'Vui lòng nhập mật khẩu.';
    if (form.matKhau.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';

    // Các ràng buộc bổ sung riêng cho chế độ Đăng ký
    if (laDangKy) {
      if (!form.hoTen.trim()) return 'Vui lòng nhập họ và tên.';
      if (!form.soDienThoai.trim()) return 'Vui lòng nhập số điện thoại.';
      if (!/^(0|\+84)[0-9]{9,10}$/.test(form.soDienThoai.trim())) {
        return 'Số điện thoại không hợp lệ.';
      }
      if (form.matKhau !== form.xacNhanMatKhau) {
        return 'Mật khẩu xác nhận không khớp.';
      }
    }
    return '';
  };

  // xử lý gửi form dnhap/dky lên api
  const xuLySubmit = async (e) => {
    e.preventDefault();
    const thongBaoLoi = kiemTraHopLe();
    if (thongBaoLoi) {
      setLoi(thongBaoLoi);
      return;
    }

    setDangGui(true);
    setLoi('');

    try {
      // gọi API tương ứng theo chế độ hiện tại
      const response = laDangKy
        ? await dangKyApi({
            hoTen: form.hoTen.trim(),
            email: form.email.trim(),
            soDienThoai: form.soDienThoai.trim(),
            matKhau: form.matKhau,
            vaiTro: form.vaiTro,
          })
        : await dangNhapApi({
            email: form.email.trim(),
            matKhau: form.matKhau,
          });

      // lưu JWT Token & thông tin người dùng vào AuthContext (và localStorage)
      const taiKhoan = await setSession(response);
      const vaiTroHienTai = taiKhoan?.vaiTro || response?.data?.nguoiDung?.vaiTro;

      // Phân luồng trang đích theo vai trò tài khoản (không bao giờ quay lại /trang-chu)
      const trangDich = xacDinhTrangDich(vaiTroHienTai, location.state?.from);

      navigate(trangDich, { replace: true });
    } catch (error) {
      setLoi(error.message || 'Thao tác thất bại, vui lòng thử lại.');
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Cột trái: Thương hiệu StaySync & Minh họa tòa nhà */}
      <div className="auth-left">
        <div className="auth-brand">
          <img src={logoNgoiNha} alt="Logo StaySync" width="76" height="76" />
          <span className="auth-brand-text">StaySync</span>
        </div>

        <div className="auth-building-art">
          <svg viewBox="0 0 400 170" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 155 Q200 130 400 155" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="65" y="45" width="75" height="105" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
            <rect x="140" y="25" width="120" height="125" stroke="rgba(255,255,255,0.65)" strokeWidth="1.4" />
            <rect x="260" y="45" width="75" height="105" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
            <rect x="175" y="105" width="50" height="45" stroke="rgba(255,255,255,0.7)" strokeWidth="1.3" />
            <path d="M135 25 L200 12 L265 25" stroke="rgba(255,255,255,0.65)" strokeWidth="1.4" />
            <g stroke="rgba(255,255,255,0.45)" strokeWidth="1">
              <rect x="80" y="60" width="14" height="18" />
              <rect x="108" y="60" width="14" height="18" />
              <rect x="80" y="90" width="14" height="18" />
              <rect x="108" y="90" width="14" height="18" />
              <rect x="155" y="42" width="16" height="20" />
              <rect x="192" y="42" width="16" height="20" />
              <rect x="229" y="42" width="16" height="20" />
              <rect x="155" y="74" width="16" height="20" />
              <rect x="192" y="74" width="16" height="20" />
              <rect x="229" y="74" width="16" height="20" />
              <rect x="276" y="60" width="14" height="18" />
              <rect x="304" y="60" width="14" height="18" />
              <rect x="276" y="90" width="14" height="18" />
              <rect x="304" y="90" width="14" height="18" />
            </g>
          </svg>
        </div>
      </div>

      {/* Cột phải: Biểu mẫu Đăng nhập / Đăng ký */}
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-header">
            <h1 className="auth-title">{laDangKy ? 'Đăng ký' : 'Đăng nhập'}</h1>
            <p className="auth-subtitle">
              {laDangKy ? 'Tạo tài khoản mới để bắt đầu' : 'Vui lòng đăng nhập để tiếp tục'}
            </p>
          </div>

          {/* Hiển thị thông báo lỗi validate hoặc lỗi từ API */}
          {loi && <div className="auth-error">{loi}</div>}

          <form className="auth-form" onSubmit={xuLySubmit} noValidate>
            {/* Các trường chỉ hiển thị khi ở chế độ Đăng ký */}
            {laDangKy && (
              <>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#071A95">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    name="hoTen"
                    className="auth-input"
                    placeholder="Họ và tên"
                    value={form.hoTen}
                    onChange={xuLyThayDoi}
                  />
                </div>

                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#071A95">
                      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
                    </svg>
                  </span>
                  <input
                    type="tel"
                    name="soDienThoai"
                    className="auth-input"
                    placeholder="Số điện thoại"
                    value={form.soDienThoai}
                    onChange={xuLyThayDoi}
                  />
                </div>
              </>
            )}

            {/* Ô nhập Email */}
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <img src={iconEmail} alt="" width="18" height="18" />
              </span>
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="Email"
                value={form.email}
                onChange={xuLyThayDoi}
              />
            </div>

            {/* Ô nhập Mật khẩu kèm nút bật/tắt hiển thị */}
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <img src={iconKhoa} alt="" width="18" height="18" />
              </span>
              <input
                type={hienMatKhau ? 'text' : 'password'}
                name="matKhau"
                className="auth-input"
                placeholder="Mật khẩu"
                value={form.matKhau}
                onChange={xuLyThayDoi}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setHienMatKhau((prev) => !prev)}
                aria-label="Hiện hoặc ẩn mật khẩu"
              >
                {hienMatKhau ? (
                  <svg width="20" height="20" viewBox="0 0 38 38" fill="none">
                    <path d="M1 19C10 3 28 3 37 19C28 35 10 35 1 19Z" fill="#071A95" />
                    <path
                      d="M19 27C23.4183 27 27 23.4183 27 19C27 14.5817 23.4183 11 19 11C14.5817 11 11 14.5817 11 19C11 23.4183 14.5817 27 19 27Z"
                      fill="white"
                    />
                    <path
                      d="M19 23C21.2091 23 23 21.2091 23 19C23 16.7909 21.2091 15 19 15C16.7909 15 15 16.7909 15 19C15 21.2091 16.7909 23 19 23Z"
                      fill="#071A95"
                    />
                  </svg>
                ) : (
                  <img src={iconAnMatKhau} alt="" width="20" height="20" />
                )}
              </button>
            </div>

            {/* Xác nhận mật khẩu & chọn vai trò tài khoản khi Đăng ký */}
            {laDangKy && (
              <>
                <div className="auth-input-group">
                  <span className="auth-input-icon">
                    <img src={iconKhoa} alt="" width="18" height="18" />
                  </span>
                  <input
                    type={hienMatKhau ? 'text' : 'password'}
                    name="xacNhanMatKhau"
                    className="auth-input"
                    placeholder="Xác nhận mật khẩu"
                    value={form.xacNhanMatKhau}
                    onChange={xuLyThayDoi}
                  />
                </div>

                <div className="auth-role-group">
                  <label className={`auth-role-option ${form.vaiTro === 'KHACH_THUE' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="vaiTro"
                      value="KHACH_THUE"
                      checked={form.vaiTro === 'KHACH_THUE'}
                      onChange={xuLyThayDoi}
                      style={{ display: 'none' }}
                    />
                    Khách thuê trọ
                  </label>
                  <label className={`auth-role-option ${form.vaiTro === 'CHU_TRO' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="vaiTro"
                      value="CHU_TRO"
                      checked={form.vaiTro === 'CHU_TRO'}
                      onChange={xuLyThayDoi}
                      style={{ display: 'none' }}
                    />
                    Chủ nhà trọ
                  </label>
                </div>
              </>
            )}

            {/* Nút gửi biểu mẫu */}
            <button type="submit" className="auth-submit-btn" disabled={dangGui}>
              <span>{dangGui ? 'Đang xử lý...' : laDangKy ? 'Đăng ký' : 'Đăng nhập'}</span>
              {!dangGui && <img src={iconMuiTen} alt="" width="18" height="18" />}
            </button>
          </form>

          <div className="auth-divider">
            <span>Hoặc</span>
          </div>

          {/* Liên kết chuyển chế độ Đăng nhập / Đăng ký */}
          <div className="auth-switch">
            {laDangKy ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button type="button" className="auth-switch-btn" onClick={chuyenCheDo}>
              {laDangKy ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}