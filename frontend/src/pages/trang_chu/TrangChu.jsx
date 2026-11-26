import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Calendar,
  House,
  LogIn,
  MapPin,
  Maximize2,
  Search,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api.js';
import { layDanhSachOGhepApi } from '../../services/o_ghep_service.js';
import { layUrlAnh } from '../../services/upload_service.js';
import { formatDate, formatMoney, idOf } from '../../utils/format.js';
import './TrangChu.css';

export default function TrangChu() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Từ khóa & mức giá tìm nhanh trên Hero
  const [tuKhoa, setTuKhoa] = useState('');
  const [mucGia, setMucGia] = useState('');

  // Dữ liệu hiển thị từ API
  const [dsTinDang, setDsTinDang] = useState([]);
  const [dsOGhep, setDsOGhep] = useState([]);
  const [dsBaiViet, setDsBaiViet] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    let active = true;

    async function taiDuLieuTrangChu() {
      setDangTai(true);
      const [tinRes, oGhepRes, baiVietRes] = await Promise.allSettled([
        api.get('/tin-dang', { params: { limit: 6 } }),
        layDanhSachOGhepApi({ limit: 3 }),
        api.get('/bai-viet', { params: { limit: 3 } }),
      ]);

      if (!active) return;

      if (tinRes.status === 'fulfilled') {
        const list = tinRes.value.data?.items || tinRes.value.data || [];
        setDsTinDang(Array.isArray(list) ? list.slice(0, 6) : []);
      }

      if (oGhepRes.status === 'fulfilled') {
        const list = oGhepRes.value.data?.items || oGhepRes.value.data || [];
        setDsOGhep(Array.isArray(list) ? list.slice(0, 3) : []);
      }

      if (baiVietRes.status === 'fulfilled') {
        const list = baiVietRes.value.data?.items || baiVietRes.value.data || [];
        setDsBaiViet(Array.isArray(list) ? list.slice(0, 3) : []);
      }

      setDangTai(false);
    }

    taiDuLieuTrangChu();
    return () => {
      active = false;
    };
  }, []);

  function xuLyTimKiemNhanh(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tuKhoa.trim()) params.set('q', tuKhoa.trim());
    if (mucGia) params.set('gia', mucGia);
    navigate(`/tim-phong?${params.toString()}`);
  }

  const duongDanVaoHeThong =
    user?.vaiTro === 'CHU_TRO' || user?.vaiTro === 'ADMIN'
      ? '/thong-ke'
      : '/khach-thue/tai-khoan';

  return (
    <div className="tc-page">
      {/* Thanh điều hướng công khai */}
      <header className="tc-navbar">
        <div className="tc-container tc-navbar-inner">
          <Link to="/trang-chu" className="tc-brand">
            <span className="tc-brand-mark">S</span>
            <span>
              Stay<span>Sync</span>
            </span>
          </Link>

          <nav className="tc-nav-links" aria-label="Điều hướng chính">
            <NavLink to="/trang-chu" className="tc-nav-link">
              Trang chủ
            </NavLink>
            <NavLink to="/tim-phong" className="tc-nav-link">
              Tìm phòng trọ
            </NavLink>
            <NavLink to="/khach-thue/o-ghep" className="tc-nav-link">
              Tìm bạn ở ghép
            </NavLink>
          </nav>

          <div className="tc-nav-actions">
            {user ? (
              <Link to={duongDanVaoHeThong} className="button button--primary">
                <UserCheck size={14} /> {user.hoTen || 'Không gian của tôi'}
              </Link>
            ) : (
              <>
                <Link to="/dang-nhap" className="button">
                  <LogIn size={14} /> Đăng nhập
                </Link>
                <Link to="/dang-nhap" className="button button--warm">
                  Đăng ký ngay
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner & Tìm kiếm nhanh */}
      <section className="tc-hero">
        <div className="tc-container tc-hero-grid">
          <div>
            <span className="tc-hero-pill">
              <Sparkles size={13} /> Nền tảng tìm trọ & vận hành phòng minh bạch
            </span>
            <h1 className="tc-hero-title">
              Tìm phòng trọ ưng ý, kết nối <span>bạn ở ghép</span> và đặt lịch xem trực tuyến
            </h1>
            <p className="tc-hero-desc">
              Tra cứu thông tin phòng thật, đơn giá điện nước rõ ràng, đặt lịch hẹn trực tiếp với
              chủ trọ và quản lý mọi tiện ích sinh hoạt ngay trên StaySync.
            </p>

            <form className="tc-search-bar" onSubmit={xuLyTimKiemNhanh}>
              <div className="tc-search-field">
                <Search size={16} />
                <input
                  type="text"
                  className="field"
                  placeholder="Nhập khu vực, tên đường, quận/huyện..."
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                />
              </div>

              <select
                className="select tc-search-select"
                value={mucGia}
                onChange={(e) => setMucGia(e.target.value)}
              >
                <option value="">Tất cả mức giá</option>
                <option value="DUOI_2TR">Dưới 2 triệu</option>
                <option value="2_DEN_3_5TR">2 - 3.5 triệu</option>
                <option value="TREN_3_5TR">Trên 3.5 triệu</option>
              </select>

              <button type="submit" className="button button--warm">
                <Search size={14} /> Tìm phòng ngay
              </button>
            </form>
          </div>

          {/* Bảng tóm tắt hệ sinh thái StaySync */}
          <aside className="tc-hero-card">
            <h2 className="tc-hero-card-title">Trải nghiệm thuê trọ đồng bộ trên StaySync</h2>
            <div className="tc-stat-list">
              <div className="tc-stat-item">
                <strong>{dsTinDang.length > 0 ? `${dsTinDang.length}+` : '100%'}</strong>
                <span>Tin phòng xác thực</span>
              </div>
              <div className="tc-stat-item">
                <strong>24/7</strong>
                <span>Đặt lịch xem trực tuyến</span>
              </div>
              <div className="tc-stat-item">
                <strong>{dsOGhep.length > 0 ? `${dsOGhep.length}+` : 'Nhanh'}</strong>
                <span>Hồ sơ ở ghép phù hợp</span>
              </div>
              <div className="tc-stat-item">
                <strong>Minh bạch</strong>
                <span>Hóa đơn & báo sửa chữa</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link to="/tim-phong" className="button button--primary" style={{ flex: 1 }}>
                Khám phá danh sách phòng <ArrowRight size={14} />
              </Link>
              <Link to="/khach-thue/o-ghep" className="button">
                <Users size={14} /> Ở ghép
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Danh sách phòng trọ nổi bật */}
      <section className="tc-section">
        <div className="tc-container">
          <div className="tc-section-head">
            <div>
              <h2>Phòng trọ đang mở cho thuê</h2>
              <p>Cập nhật các tin đăng mới nhất kèm giá thuê, diện tích và tiện nghi thực tế.</p>
            </div>
            <Link to="/tim-phong" className="button">
              Xem tất cả phòng <ArrowRight size={14} />
            </Link>
          </div>

          {dangTai ? (
            <div className="panel" style={{ padding: 24, textAlign: 'center', color: '#64758d' }}>
              Đang tải danh sách phòng nổi bật...
            </div>
          ) : dsTinDang.length === 0 ? (
            <div className="panel" style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', color: '#64758d' }}>
                Hiện chưa có tin đăng phòng công khai. Bạn có thể chuyển sang trang Tìm phòng để tra
                cứu thêm.
              </p>
              <Link to="/tim-phong" className="button button--primary">
                Đến trang Tìm phòng
              </Link>
            </div>
          ) : (
            <div className="tc-room-grid">
              {dsTinDang.map((tin) => {
                const tinId = idOf(tin);
                const anhBia = Array.isArray(tin.hinhAnh) ? tin.hinhAnh[0] : tin.anhDaiDien;
                const giaThue = tin.giaThue || tin.phong?.giaThue || 0;
                const dienTich = tin.dienTich || tin.phong?.dienTich;
                const diaChi =
                  tin.diaChi ||
                  tin.dayTro?.diaChi ||
                  tin.khuVuc ||
                  'Khu vực trung tâm, thuận tiện đi lại';

                return (
                  <article className="tc-room-card" key={tinId}>
                    <div className="tc-room-thumb">
                      {anhBia ? (
                        <img src={layUrlAnh(anhBia)} alt={tin.tieuDe} />
                      ) : (
                        <House size={36} strokeWidth={1.6} />
                      )}
                      <span className="tc-room-price-badge">
                        {giaThue > 0 ? `${formatMoney(giaThue)}/tháng` : 'Liên hệ giá'}
                      </span>
                    </div>

                    <div className="tc-room-body">
                      <div>
                        <h3 className="tc-room-title">{tin.tieuDe || 'Phòng trọ tiện nghi'}</h3>
                        <div className="tc-room-address">
                          <MapPin size={13} />
                          <span>{diaChi}</span>
                        </div>
                      </div>

                      <div>
                        <div className="tc-room-specs">
                          {dienTich && (
                            <span>
                              <Maximize2 size={12} style={{ marginRight: 4 }} />
                              {dienTich} m²
                            </span>
                          )}
                          {tin.dayTro?.tenDayTro && (
                            <span>
                              <Building2 size={12} style={{ marginRight: 4 }} />
                              {tin.dayTro.tenDayTro}
                            </span>
                          )}
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <Link
                            to={`/tim-phong?tinId=${tinId}`}
                            className="button button--primary"
                            style={{ width: '100%' }}
                          >
                            Xem chi tiết & Đặt lịch
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bảng tin & Cộng đồng StaySync */}
      {dsBaiViet.length > 0 && (
        <section className="tc-section" style={{ paddingTop: 0 }}>
          <div className="tc-container">
            <div className="tc-section-head">
              <div>
                <h2>Bảng tin & Sự kiện khu trọ</h2>
                <p>Thông báo mới, kinh nghiệm thuê trọ an toàn và hoạt động cộng đồng.</p>
              </div>
            </div>

            <div className="tc-news-grid">
              {dsBaiViet.map((bv) => (
                <article className="tc-news-card" key={idOf(bv)}>
                  <div>
                    <span className="tc-news-type">
                      {bv.loaiBaiViet === 'SU_KIEN' ? 'Sự kiện' : 'Tin tức'}
                    </span>
                    <h3>{bv.tieuDe}</h3>
                    <p>{bv.tomTat || bv.noiDung}</p>
                  </div>
                  <div className="cell-subtitle">
                    <Calendar size={12} style={{ marginRight: 4, verticalAlign: '-1px' }} />
                    {bv.createdAt ? formatDate(bv.createdAt) : 'Mới cập nhật'}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="tc-footer">
        <div className="tc-container tc-footer-inner">
          <div>
            <strong style={{ color: '#174ea6' }}>StaySync</strong> — Hệ thống quản lý phòng trọ và
            kết nối thuê trọ thông minh.
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/tim-phong" style={{ color: '#365170', textDecoration: 'none' }}>
              Tìm phòng
            </Link>
            <Link to="/khach-thue/o-ghep" style={{ color: '#365170', textDecoration: 'none' }}>
              Tìm ở ghép
            </Link>
            <Link to="/dang-nhap" style={{ color: '#2563d9', textDecoration: 'none' }}>
              Đăng nhập hệ thống
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}