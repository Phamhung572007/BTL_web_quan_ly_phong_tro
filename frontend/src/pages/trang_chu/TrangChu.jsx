import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api.js';
import { layUrlAnh } from '../../services/upload_service.js';
import { formatMoney, idOf } from '../../utils/format.js';

// Tận dụng lại 2 file SVG có sẵn từ DangNhap
import logoNgoiNha from '../../assets/icons/logo-ngoi-nha.svg';
import iconEmail from '../../assets/icons/icon-email.svg';

// Các icon bổ sung cho TrangChu
import iconKinhLup from '../../assets/icons/icon-kinh-lup.svg';
import iconDangNhap from '../../assets/icons/icon-dang-nhap.svg';
import iconBanOGhep from '../../assets/icons/icon-ban-o-ghep.svg';
import iconLich from '../../assets/icons/icon-lich.svg';
import iconHoaDon from '../../assets/icons/icon-hoa-don.svg';
import iconSuCo from '../../assets/icons/icon-su-co.svg';
import iconHopDong from '../../assets/icons/icon-hop-dong.svg';
import iconKyThuat from '../../assets/icons/icon-ky-thuat.svg';
import iconLocationPin from '../../assets/icons/icon-location-pin.svg';

import './TrangChu.css';

export default function TrangChu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tuKhoa, setTuKhoa] = useState('');
  const [mucGia, setMucGia] = useState('TAT_CA');

  const [dsTinNoiBat, setDsTinNoiBat] = useState([]);
  const [dsOGhepNoiBat, setDsOGhepNoiBat] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    if (user) return;
    let huy = false;

    async function taiDuLieuTrangChu() {
      setDangTai(true);
      try {
        const [tinRes, oGhepRes] = await Promise.allSettled([
          api.get('/tin-dang', { params: { limit: 6 } }),
          api.get('/o-ghep', { params: { limit: 3 } }),
        ]);

        if (!huy) {
          if (tinRes.status === 'fulfilled') {
            const rawTin = tinRes.value.data?.items || tinRes.value.data || [];
            setDsTinNoiBat(Array.isArray(rawTin) ? rawTin.slice(0, 6) : []);
          }
          if (oGhepRes.status === 'fulfilled') {
            const rawOGhep = oGhepRes.value.data?.items || oGhepRes.value.data || [];
            setDsOGhepNoiBat(Array.isArray(rawOGhep) ? rawOGhep.slice(0, 3) : []);
          }
        }
      } finally {
        if (!huy) setDangTai(false);
      }
    }

    taiDuLieuTrangChu();
    return () => {
      huy = true;
    };
  }, [user]);

  // Nếu đã đăng nhập thì chuyển thẳng vào không gian làm việc
  if (user) {
    const dich =
      user.vaiTro === 'CHU_TRO' || user.vaiTro === 'ADMIN'
        ? '/thong-ke'
        : '/khach-thue/tim-phong';
    return <Navigate to={dich} replace />;
  }

  // Chưa đăng nhập: bấm vào bất kỳ nút nào đều đưa sang /dang-nhap kèm đường dẫn đích
  function dieuHuongCoBaoVe(duongDanDich) {
    navigate('/dang-nhap', { state: { from: duongDanDich } });
  }

  function xuLyTimKiem(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tuKhoa.trim()) params.set('q', tuKhoa.trim());
    if (mucGia !== 'TAT_CA') params.set('gia', mucGia);
    const query = params.toString();
    const dich = query ? `/khach-thue/tim-phong?${query}` : '/khach-thue/tim-phong';
    dieuHuongCoBaoVe(dich);
  }

  return (
    <div className="tc-page">
      {/* 1. Thanh điều hướng trên cùng */}
      <header className="tc-navbar">
        <div className="tc-container tc-navbar-inner">
          <Link to="/trang-chu" className="tc-brand">
            <span className="tc-brand-mark">
              <img src={logoNgoiNha} alt="Logo StaySync" width="22" height="22" />
            </span>
            <span className="tc-brand-text">StaySync</span>
          </Link>

          <nav className="tc-nav-links" aria-label="Điều hướng chính">
            <Link to="/trang-chu" className="tc-nav-link is-active">
              Trang chủ
            </Link>
            <button
              type="button"
              className="tc-nav-link"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}
            >
              Tìm phòng trọ
            </button>
            <button
              type="button"
              className="tc-nav-link"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
            >
              Tìm bạn ở ghép
            </button>
          </nav>

          <div className="tc-nav-actions">
            <Link
              to="/dang-nhap"
              state={{ from: '/khach-thue/tim-phong' }}
              className="tc-btn-login"
            >
              <img src={iconDangNhap} alt="" width="16" height="16" />
              <span>Đăng nhập</span>
            </Link>
            <Link
              to="/dang-nhap"
              state={{ from: '/khach-thue/tim-phong' }}
              className="tc-btn-register"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero & Khung tìm kiếm */}
      <section className="tc-hero">
        <div className="tc-container">
          <h1 className="tc-hero-title">Tìm phòng trọ lý tưởng ngay hôm nay</h1>
          <p className="tc-hero-sub">
            Không gian tiện nghi – Giá cả hợp lý – Dịch vụ tận tâm dành cho mọi người
          </p>

          <form className="tc-search-card" onSubmit={xuLyTimKiem}>
            <div className="tc-search-input-wrap">
              <img src={iconKinhLup} alt="" width="18" height="18" className="tc-search-icon" />
              <input
                type="text"
                className="tc-search-input"
                placeholder="Nhập tên đường, khu vực, quận... (Ví dụ: Trần Phú, Hà Đông, Phú Lương)"
                value={tuKhoa}
                onChange={(e) => setTuKhoa(e.target.value)}
              />
            </div>

            <div className="tc-search-field-group">
              <label className="tc-search-label" htmlFor="tc-select-gia">
                Khoảng giá thuê:
              </label>
              <select
                id="tc-select-gia"
                className="tc-search-select"
                value={mucGia}
                onChange={(e) => setMucGia(e.target.value)}
              >
                <option value="TAT_CA">Mọi mức giá</option>
                <option value="DUOI_2TR">Dưới 2 triệu / tháng</option>
                <option value="2_DEN_3_5TR">2 - 3.5 triệu / tháng</option>
                <option value="TREN_3_5TR">Trên 3.5 triệu / tháng</option>
              </select>
            </div>

            <div className="tc-search-submit-wrap">
              <button type="submit" className="tc-btn-search">
                <img
                  src={iconKinhLup}
                  alt=""
                  width="16"
                  height="16"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <span>Tìm kiếm phòng</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Phòng trọ đang mở cho thuê */}
      <section className="tc-section">
        <div className="tc-container">
          <div className="tc-section-head">
            <div>
              <h2 className="tc-section-title">Phòng trọ đang mở cho thuê</h2>
              <p className="tc-section-sub">
                Đăng nhập tài khoản để xem chi tiết hình ảnh, diện tích và đặt lịch hẹn xem phòng.
              </p>
            </div>
            <button
              type="button"
              className="tc-btn-navy"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}
            >
              <span>Xem tất cả phòng</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {dangTai ? (
            <p className="tc-empty-line">Đang tải danh sách phòng trọ nổi bật...</p>
          ) : dsTinNoiBat.length === 0 ? (
            <p className="tc-empty-line">
              Hiện chưa có tin đăng phòng trọ mới. Đăng nhập để cập nhật thêm tin đăng từ các dãy trọ.
            </p>
          ) : (
            <div className="tc-room-grid">
              {dsTinNoiBat.map((tin) => {
                const tinId = idOf(tin);
                const anhBia = Array.isArray(tin.hinhAnh) ? tin.hinhAnh[0] : tin.anhDaiDien;
                const gia = Number(tin.giaThue || tin.phong?.giaThue) || 0;
                const dienTich = tin.dienTich || tin.phong?.dienTich;
                const diaChi =
                  tin.diaChi || tin.dayTro?.diaChi || tin.khuVuc || 'Khu vực trung tâm';

                return (
                  <article className="tc-room-card" key={tinId}>
                    <div className="tc-room-thumb">
                      {anhBia ? (
                        <img src={layUrlAnh(anhBia)} alt={tin.tieuDe} />
                      ) : (
                        <div className="tc-room-placeholder">
                          <img src={logoNgoiNha} alt="" width="34" height="34" />
                        </div>
                      )}
                      <span className="tc-room-badge">Đang mở thuê</span>
                    </div>

                    <div className="tc-room-body">
                      <h3 className="tc-room-title">{tin.tieuDe || 'Phòng trọ tiện nghi'}</h3>
                      <div className="tc-room-meta">
                        <img src={iconLocationPin} alt="" width="14" height="14" />
                        <span>{diaChi}</span>
                      </div>
                      {dienTich && (
                        <div className="tc-room-meta">
                          <span>Diện tích: {dienTich} m²</span>
                        </div>
                      )}

                      <div className="tc-room-footer">
                        <div className="tc-room-price">
                          {gia > 0 ? formatMoney(gia) : 'Thỏa thuận'}
                          {gia > 0 && <small>/tháng</small>}
                        </div>
                        <button
                          type="button"
                          className="tc-btn-navy tc-btn-navy--sm"
                          onClick={() => dieuHuongCoBaoVe(`/khach-thue/tim-phong?tinId=${tinId}`)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Kết nối tìm bạn ở ghép */}
      <section className="tc-section tc-section--compact">
        <div className="tc-container">
          <div className="tc-section-head">
            <div>
              <h2 className="tc-section-title">Kết nối tìm bạn ở ghép</h2>
              <p className="tc-section-sub">
                Chia sẻ chi phí thuê phòng cùng sinh viên và người đi làm có cùng thói quen sinh hoạt.
              </p>
            </div>
            <button
              type="button"
              className="tc-btn-orange"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
            >
              <img src={iconBanOGhep} alt="" width="16" height="16" />
              <span>Khám phá ở ghép</span>
            </button>
          </div>

          {dsOGhepNoiBat.length === 0 ? (
            <p className="tc-empty-line">
              Đăng nhập ngay để đăng hồ sơ tìm bạn ở ghép hoặc xem danh sách người đang tìm phòng ghép.
            </p>
          ) : (
            <div className="tc-roommate-grid">
              {dsOGhepNoiBat.map((item) => (
                <article className="tc-roommate-card" key={idOf(item)}>
                  <h3 className="tc-roommate-title">{item.tieuDe}</h3>
                  <div className="tc-room-meta">
                    <img src={iconLocationPin} alt="" width="14" height="14" />
                    <span>Khu vực: {item.khuVucMongMuon || 'Linh hoạt'}</span>
                  </div>
                  <p className="tc-roommate-desc">
                    {item.moTaBanThan ||
                      'Tìm bạn ở ghép lịch sự, gọn gàng, chia sẻ chi phí minh bạch.'}
                  </p>
                  <div className="tc-room-footer">
                    <span className="tc-room-price" style={{ fontSize: 15 }}>
                      {Number(item.nganSachToiDa) > 0
                        ? `Tối đa ${formatMoney(item.nganSachToiDa)}`
                        : 'Ngân sách thỏa thuận'}
                    </span>
                    <button
                      type="button"
                      className="tc-btn-orange tc-btn-orange--sm"
                      onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
                    >
                      Kết nối
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Chuẩn mực quản trị số - Tại Sao Nên Chọn Thuê Qua StaySync? */}
      <section className="tc-why-section">
        <div className="tc-container">
          <div className="tc-why-head">
            <span className="tc-why-kicker">CHUẨN MỰC QUẢN TRỊ SỐ</span>
            <h2 className="tc-why-title">Tại Sao Nên Chọn Thuê Qua StaySync?</h2>
            <p className="tc-why-sub">
              Giải quyết triệt để nỗi lo bị chặt chém tiền điện nước, mất trộm đồ hay hợp đồng thiếu
              minh bạch khi thuê trọ sinh viên.
            </p>
          </div>

          <div className="tc-feature-grid">
            <div className="tc-feature-card">
              <div className="tc-feature-icon tc-feature-icon--blue">
                <img src={iconLich} alt="" width="22" height="22" />
              </div>
              <h3 className="tc-feature-title">Đặt Lịch Xem Phòng Trực Tuyến</h3>
              <p className="tc-feature-desc">
                Chọn khung giờ rảnh và gửi yêu cầu trực tiếp tới chủ trọ, nhận xác nhận nhanh chóng mà
                không qua trung gian.
              </p>
            </div>

            <div className="tc-feature-card">
              <div className="tc-feature-icon tc-feature-icon--indigo">
                <img src={iconHoaDon} alt="" width="22" height="22" />
              </div>
              <h3 className="tc-feature-title">Điện Nước Số Hóa Minh Bạch</h3>
              <p className="tc-feature-desc">
                Theo dõi chỉ số điện nước, tiền phòng hàng tháng và lưu trữ hợp đồng điện tử ngay
                trên tài khoản cá nhân.
              </p>
            </div>

            <div className="tc-feature-card">
              <div className="tc-feature-icon tc-feature-icon--sky">
                <img src={iconSuCo} alt="" width="22" height="22" />
              </div>
              <h3 className="tc-feature-title">Báo Cáo Sự Cố 1 Chạm</h3>
              <p className="tc-feature-desc">
                Gửi yêu cầu bảo trì thiết bị kèm hình ảnh thực tế và theo dõi tiến độ xử lý của chủ
                trọ theo thời gian thực.
              </p>
            </div>

            <div className="tc-feature-card">
              <div className="tc-feature-icon tc-feature-icon--blue">
                <img src={iconHopDong} alt="" width="22" height="22" />
              </div>
              <h3 className="tc-feature-title">Hợp Đồng Điện Tử Chuẩn StaySync</h3>
              <p className="tc-feature-desc">
                Điều khoản bảo vệ quyền lợi người thuê rõ ràng, lưu trữ vĩnh viễn trên tài khoản. Cam
                kết không tăng giá bất thường trong suốt chu kỳ thuê.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer 3 cột giống ảnh mẫu */}
      <footer className="tc-footer">
        <div className="tc-container tc-footer-grid">
          <div className="tc-footer-col">
            <Link to="/trang-chu" className="tc-brand tc-brand--footer">
              <span className="tc-brand-mark tc-brand-mark--lg">
                <img src={logoNgoiNha} alt="Logo StaySync" width="24" height="24" />
              </span>
              <span className="tc-brand-text">StaySync</span>
            </Link>
            <p className="tc-footer-desc">
              Nền tảng quản lý nhà trọ và kết nối lưu trú số dành riêng cho cộng đồng sinh viên và
              người đi làm.
            </p>
          </div>

          <div className="tc-footer-col">
            <h4 className="tc-footer-heading">HOTLINE & TRỢ GIÚP</h4>
            <ul className="tc-footer-list">
              <li>
                <img src={iconKyThuat} alt="" width="15" height="15" />
                <span>
                  <strong>Kỹ thuật & Vận hành:</strong> 1900 8198
                </span>
              </li>
              <li>
                <img src={iconEmail} alt="" width="15" height="15" />
                <span>
                  <strong>Hỗ trợ chủ trọ:</strong> support@staysync.vn
                </span>
              </li>
              <li>
                <img src={iconLocationPin} alt="" width="15" height="15" />
                <span>
                  <strong>Địa chỉ:</strong> Số 122, phố Yên Lãng, phường Đống Đa, Hà Nội.
                </span>
              </li>
            </ul>
          </div>

          <div className="tc-footer-col">
            <h4 className="tc-footer-heading">CHÍNH SÁCH & QUY ĐỊNH</h4>
            <ul className="tc-footer-links">
              <li>
                <button type="button" onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}>
                  › Điều khoản sử dụng
                </button>
              </li>
              <li>
                <button type="button" onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}>
                  › Chính sách bảo mật thông tin
                </button>
              </li>
              <li>
                <button type="button" onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}>
                  › Quy chế hoạt động & giải quyết tranh chấp
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}