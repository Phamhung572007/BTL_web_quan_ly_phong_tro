import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  House,
  LogIn,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api.js';
import { layUrlAnh } from '../../services/upload_service.js';
import { formatMoney, idOf } from '../../utils/format.js';
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

  // Đã đăng nhập thì không ở trang Landing nữa mà chuyển thẳng vào không gian làm việc
  if (user) {
    const dich =
      user.vaiTro === 'CHU_TRO' || user.vaiTro === 'ADMIN'
        ? '/thong-ke'
        : '/khach-thue/tim-phong';
    return <Navigate to={dich} replace />;
  }

  // Chưa đăng nhập thì đưa sang /dang-nhap kèm đường dẫn đích để sau khi đăng nhập nhảy tới đúng trang đó
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
      {/* Thanh điều hướng Landing */}
      <header className="tc-navbar">
        <div className="tc-container tc-navbar-inner">
          <Link to="/trang-chu" className="tc-brand">
            <span className="tc-brand-mark">S</span>
            <span>
              Stay<span>Sync</span>
            </span>
          </Link>

          <nav className="tc-nav-links" aria-label="Điều hướng chính">
            <Link to="/trang-chu" className="tc-nav-link active">
              Trang chủ
            </Link>
            <button
              type="button"
              className="tc-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}
            >
              Tìm phòng trọ
            </button>
            <button
              type="button"
              className="tc-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
              onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
            >
              Tìm bạn ở ghép
            </button>
          </nav>

          <div className="tc-nav-actions">
            <Link to="/dang-nhap" state={{ from: '/khach-thue/tim-phong' }} className="button">
              <LogIn size={14} /> Đăng nhập
            </Link>
            <Link
              to="/dang-nhap"
              state={{ from: '/khach-thue/tim-phong' }}
              className="button button--warm"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </header>

      {/* Khu vực Hero & Thanh tìm kiếm */}
      <section className="tc-hero">
        <div className="tc-container">
          <div className="tc-hero-badge">
            <Sparkles size={13} /> Nền tảng tìm trọ & quản lý lưu trú đồng bộ
          </div>
          <h1 className="tc-hero-title">
            Tìm phòng trọ minh bạch, đặt lịch xem phòng & kết nối ở ghép dễ dàng
          </h1>
          <p className="tc-hero-sub">
            Xem trước danh sách phòng trọ đang mở trên hệ thống. Đăng nhập để lọc chi tiết, đặt lịch
            xem phòng trực tiếp với chủ trọ và theo dõi hợp đồng, hóa đơn minh bạch.
          </p>

          <form className="tc-search-card" onSubmit={xuLyTimKiem}>
            <input
              type="text"
              className="field tc-search-input"
              placeholder="Nhập tên đường, khu vực, quận hoặc tên dãy trọ..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <select
              className="select tc-search-select"
              value={mucGia}
              onChange={(e) => setMucGia(e.target.value)}
            >
              <option value="TAT_CA">Mọi mức giá</option>
              <option value="DUOI_2TR">Dưới 2 triệu / tháng</option>
              <option value="2_DEN_3_5TR">2 - 3.5 triệu / tháng</option>
              <option value="TREN_3_5TR">Trên 3.5 triệu / tháng</option>
            </select>
            <button type="submit" className="button button--warm tc-search-btn">
              <Search size={15} /> Tìm phòng ngay
            </button>
          </form>

          <div className="tc-quick-tags">
            <span>Gợi ý nhanh:</span>
            <button
              type="button"
              className="tc-quick-tag"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong?gia=DUOI_2TR')}
            >
              Phòng dưới 2 triệu
            </button>
            <button
              type="button"
              className="tc-quick-tag"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong?q=Hà Đông')}
            >
              Khu vực Hà Đông
            </button>
            <button
              type="button"
              className="tc-quick-tag"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
            >
              Tìm bạn ở ghép
            </button>
          </div>
        </div>
      </section>

      {/* Danh sách phòng trọ nổi bật */}
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
              className="button button--primary"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}
            >
              Xem tất cả phòng <ArrowRight size={14} />
            </button>
          </div>

          {dangTai ? (
            <div className="tc-empty-box">Đang tải danh sách phòng trọ nổi bật...</div>
          ) : dsTinNoiBat.length === 0 ? (
            <div className="tc-empty-box">
              Hiện chưa có tin đăng phòng trọ mới. Đăng nhập để cập nhật thêm tin đăng từ các dãy trọ.
            </div>
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
                        <House size={40} strokeWidth={1.5} />
                      )}
                      <span className="tc-room-badge">Đang mở thuê</span>
                    </div>

                    <div className="tc-room-body">
                      <h3 className="tc-room-title">{tin.tieuDe || 'Phòng trọ tiện nghi'}</h3>
                      <div className="tc-room-meta">
                        <MapPin size={14} />
                        <span>{diaChi}</span>
                      </div>
                      {dienTich && (
                        <div className="tc-room-meta">
                          <Building2 size={14} />
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
                          className="button button--primary"
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

      {/* Bảng tin tìm bạn ở ghép nổi bật */}
      <section className="tc-section tc-section--alt">
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
              className="button button--warm"
              onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
            >
              <Users size={14} /> Khám phá ở ghép
            </button>
          </div>

          {dsOGhepNoiBat.length === 0 ? (
            <div className="tc-empty-box">
              Đăng nhập ngay để đăng hồ sơ tìm bạn ở ghép hoặc xem danh sách người đang tìm phòng ghép.
            </div>
          ) : (
            <div className="tc-roommate-grid">
              {dsOGhepNoiBat.map((item) => (
                <article className="tc-roommate-card" key={idOf(item)}>
                  <h3 className="tc-roommate-title">{item.tieuDe}</h3>
                  <div className="tc-room-meta">
                    <MapPin size={14} />
                    <span>Khu vực: {item.khuVucMongMuon || 'Linh hoạt'}</span>
                  </div>
                  <p className="tc-roommate-desc">
                    {item.moTaBanThan || 'Tìm bạn ở ghép lịch sự, gọn gàng, chia sẻ chi phí minh bạch.'}
                  </p>
                  <div className="tc-room-footer">
                    <span className="tc-room-price" style={{ fontSize: 15 }}>
                      {Number(item.nganSachToiDa) > 0
                        ? `Tối đa ${formatMoney(item.nganSachToiDa)}`
                        : 'Ngân sách thỏa thuận'}
                    </span>
                    <button
                      type="button"
                      className="button"
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

      {/* Ưu điểm hệ thống */}
      <section className="tc-section">
        <div className="tc-container">
          <div className="tc-section-head">
            <div>
              <h2 className="tc-section-title">Trải nghiệm lưu trú số hóa trên StaySync</h2>
              <p className="tc-section-sub">
                Kết nối liền mạch từ lúc tìm phòng cho tới suốt quá trình sinh sống tại dãy trọ.
              </p>
            </div>
          </div>

          <div className="tc-feature-grid">
            <div className="tc-feature-card">
              <div className="tc-feature-icon">
                <CalendarCheck2 size={20} />
              </div>
              <h3 className="tc-feature-title">Đặt lịch xem phòng trực tuyến</h3>
              <p className="tc-feature-desc">
                Chọn khung giờ rảnh và gửi yêu cầu trực tiếp tới chủ trọ, nhận xác nhận nhanh chóng mà
                không qua trung gian.
              </p>
            </div>

            <div className="tc-feature-card">
              <div className="tc-feature-icon">
                <ShieldCheck size={20} />
              </div>
              <h3 className="tc-feature-title">Hợp đồng & hóa đơn minh bạch</h3>
              <p className="tc-feature-desc">
                Theo dõi chỉ số điện nước, tiền phòng hàng tháng và lưu trữ hợp đồng điện tử ngay trên
                tài khoản cá nhân.
              </p>
            </div>

            <div className="tc-feature-card">
              <div className="tc-feature-icon">
                <Wrench size={20} />
              </div>
              <h3 className="tc-feature-title">Báo sửa chữa sự cố 1 chạm</h3>
              <p className="tc-feature-desc">
                Gửi yêu cầu bảo trì thiết bị kèm hình ảnh thực tế và theo dõi tiến độ xử lý của chủ trọ
                theo thời gian thực.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tc-footer">
        <div className="tc-container tc-footer-inner">
          <div>
            <strong>StaySync</strong> — Hệ thống quản lý nhà trọ & kết nối lưu trú thông minh.
          </div>
          <div className="tc-footer-links">
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
              onClick={() => dieuHuongCoBaoVe('/khach-thue/tim-phong')}
            >
              Tìm phòng
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
              onClick={() => dieuHuongCoBaoVe('/khach-thue/o-ghep')}
            >
              Tìm ở ghép
            </button>
            <Link to="/dang-nhap" state={{ from: '/khach-thue/tim-phong' }}>
              Đăng nhập hệ thống
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}