import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  House,
  MapPin,
  Maximize2,
  MessageSquarePlus,
  RotateCcw,
  Search,
  Send,
  Star,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api.js';
import { layUrlAnh } from '../../services/upload_service.js';
import {
  EmptyState,
  Notice,
  PageHeader,
  SavingLabel,
} from '../../components/WorkspaceUI.jsx';
import { errorMessage, formatDate, formatMoney, idOf } from '../../utils/format.js';
import './TimPhong.css';

export default function TimPhong() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Bộ lọc tìm kiếm
  const [tuKhoa, setTuKhoa] = useState(searchParams.get('q') || '');
  const [locGia, setLocGia] = useState(searchParams.get('gia') || 'TAT_CA');
  const [locDienTich, setLocDienTich] = useState('TAT_CA');
  const [sapXep, setSapXep] = useState('MOI_NHAT');

  // Danh sách tin đăng & tin đang chọn xem chi tiết
  const [dsTinDang, setDsTinDang] = useState([]);
  const [tinDangChon, setTinDangChon] = useState(null);
  const [anhDangXem, setAnhDangXem] = useState('');
  const [dangTaiList, setDangTaiList] = useState(true);

  // Đánh giá của phòng đang chọn
  const [dsDanhGia, setDsDanhGia] = useState([]);
  const [dangTaiDanhGia, setDangTaiDanhGia] = useState(false);

  // Form đặt lịch xem phòng (API lịch xem của Hùng)
  const [formLichXem, setFormLichXem] = useState({
    hoTenKhach: user?.hoTen || '',
    soDienThoai: user?.soDienThoai || '',
    thoiGianXem: '',
    ghiChu: '',
  });
  const [dangDatLich, setDangDatLich] = useState(false);

  // Form gửi đánh giá phòng (API đánh giá của Hùng)
  const [formDanhGia, setFormDanhGia] = useState({
    soSao: 5,
    noiDung: '',
  });
  const [dangGuiDanhGia, setDangGuiDanhGia] = useState(false);

  // Thông báo phản hồi
  const [loi, setLoi] = useState('');
  const [thanhCong, setThanhCong] = useState('');

  // Tự điền thông tin liên hệ từ tài khoản đang đăng nhập
  useEffect(() => {
    if (user) {
      setFormLichXem((prev) => ({
        ...prev,
        hoTenKhach: prev.hoTenKhach || user.hoTen || '',
        soDienThoai: prev.soDienThoai || user.soDienThoai || '',
      }));
    }
  }, [user]);

  // Tải danh sách tin đăng phòng từ API TV2
  async function taiDanhSachTin() {
    setDangTaiList(true);
    setLoi('');
    try {
      const res = await api.get('/tin-dang', { params: { limit: 100 } });
      const list = res.data?.items || res.data || [];
      const mangTin = Array.isArray(list) ? list : [];
      setDsTinDang(mangTin);

      const tinIdUrl = searchParams.get('tinId');
      const timThay = tinIdUrl ? mangTin.find((t) => idOf(t) === tinIdUrl) : null;
      const danhSachTrong = mangTin.filter((t) => {
        const st = t.trangThaiPhong || t.phong?.trangThai;
        return !st || st === 'TRONG';
      });
      const macDinh = timThay || danhSachTrong[0] || mangTin[0] || null;
      if (macDinh) {
        chonTinDang(macDinh, false);
      }
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể tải danh sách tin đăng phòng trọ.'));
    } finally {
      setDangTaiList(false);
    }
  }

  useEffect(() => {
    taiDanhSachTin();
  }, []);

  // Tải danh sách đánh giá khi đổi tin đăng được chọn
  async function taiDanhGiaTheoTin(tin) {
    const maPhong = tin?.maPhong || tin?.phong?._id || tin?.phong || idOf(tin);
    if (!maPhong) {
      setDsDanhGia([]);
      return;
    }

    setDangTaiDanhGia(true);
    try {
      const res = await api.get('/danh-gia', { params: { maPhong, limit: 50 } });
      const list = res.data?.items || res.data || [];
      setDsDanhGia(Array.isArray(list) ? list : []);
    } catch {
      setDsDanhGia([]);
    } finally {
      setDangTaiDanhGia(false);
    }
  }

  function chonTinDang(tin, capNhatUrl = true) {
    setTinDangChon(tin);
    const danhSachAnh = Array.isArray(tin?.hinhAnh)
      ? tin.hinhAnh
      : tin?.anhDaiDien
        ? [tin.anhDaiDien]
        : [];
    setAnhDangXem(danhSachAnh[0] || '');
    setLoi('');
    setThanhCong('');

    if (capNhatUrl && tin) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tinId', idOf(tin));
      setSearchParams(nextParams, { replace: true });
    }

    taiDanhGiaTheoTin(tin);
  }

  // Lọc theo phòng trống, giá thuê, diện tích, từ khóa & sắp xếp
  const danhSachLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase();
    const ketQua = dsTinDang.filter((tin) => {
      const trangThaiPhong = tin.trangThaiPhong || tin.phong?.trangThai;
      if (trangThaiPhong && trangThaiPhong !== 'TRONG') return false;

      const gia = Number(tin.giaThue || tin.phong?.giaThue) || 0;
      if (locGia === 'DUOI_2TR' && gia > 2000000) return false;
      if (locGia === '2_DEN_3_5TR' && (gia < 2000000 || gia > 3500000)) return false;
      if (locGia === 'TREN_3_5TR' && gia <= 3500000) return false;

      const dienTich = Number(tin.dienTich || tin.phong?.dienTich) || 0;
      if (locDienTich === 'DUOI_20' && dienTich >= 20) return false;
      if (locDienTich === '20_DEN_30' && (dienTich < 20 || dienTich > 30)) return false;
      if (locDienTich === 'TREN_30' && dienTich <= 30) return false;

      if (!kw) return true;
      const chuoiTim = [
        tin.tieuDe,
        tin.moTa,
        tin.diaChi,
        tin.khuVuc,
        tin.dayTro?.tenDayTro,
        tin.dayTro?.diaChi,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return chuoiTim.includes(kw);
    });

    if (sapXep === 'GIA_TANG') {
      return [...ketQua].sort(
        (a, b) =>
          (Number(a.giaThue || a.phong?.giaThue) || 0) -
          (Number(b.giaThue || b.phong?.giaThue) || 0)
      );
    }
    if (sapXep === 'GIA_GIAM') {
      return [...ketQua].sort(
        (a, b) =>
          (Number(b.giaThue || b.phong?.giaThue) || 0) -
          (Number(a.giaThue || a.phong?.giaThue) || 0)
      );
    }
    return ketQua;
  }, [dsTinDang, tuKhoa, locGia, locDienTich, sapXep]);

  // Gửi yêu cầu đặt lịch hẹn xem phòng (API /lich-xem của Hùng)
  async function xuLyDatLichXem(e) {
    e.preventDefault();
    if (!tinDangChon) return;
    if (!formLichXem.hoTenKhach.trim() || !formLichXem.soDienThoai.trim() || !formLichXem.thoiGianXem) {
      setLoi('Vui lòng nhập họ tên, số điện thoại và thời gian hẹn xem phòng.');
      return;
    }

    setDangDatLich(true);
    setLoi('');
    setThanhCong('');
    try {
      const maPhong = tinDangChon.maPhong || tinDangChon.phong?._id || tinDangChon.phong;
      await api.post('/lich-xem', {
        maTinDang: idOf(tinDangChon),
        ...(maPhong ? { maPhong } : {}),
        hoTenKhach: formLichXem.hoTenKhach.trim(),
        soDienThoai: formLichXem.soDienThoai.trim(),
        thoiGianXem: new Date(formLichXem.thoiGianXem).toISOString(),
        ghiChu: formLichXem.ghiChu.trim(),
      });
      setThanhCong('Đã gửi lịch hẹn xem phòng thành công! Chủ trọ sẽ liên hệ xác nhận sớm nhất.');
      setFormLichXem((prev) => ({ ...prev, thoiGianXem: '', ghiChu: '' }));
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể gửi lịch hẹn xem phòng. Vui lòng thử lại.'));
    } finally {
      setDangDatLich(false);
    }
  }

  // Gửi đánh giá phòng (API /danh-gia của Hùng)
  async function xuLyGuiDanhGia(e) {
    e.preventDefault();
    if (!tinDangChon) return;
    if (!formDanhGia.noiDung.trim()) {
      setLoi('Vui lòng nhập nội dung nhận xét về phòng trọ.');
      return;
    }

    setDangGuiDanhGia(true);
    setLoi('');
    setThanhCong('');
    try {
      const maPhong = tinDangChon.maPhong || tinDangChon.phong?._id || tinDangChon.phong || idOf(tinDangChon);
      await api.post('/danh-gia', {
        maPhong,
        maTinDang: idOf(tinDangChon),
        soSao: Number(formDanhGia.soSao) || 5,
        noiDung: formDanhGia.noiDung.trim(),
      });
      setThanhCong('Cảm ơn bạn đã gửi đánh giá phòng!');
      setFormDanhGia({ soSao: 5, noiDung: '' });
      await taiDanhGiaTheoTin(tinDangChon);
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể gửi đánh giá phòng.'));
    } finally {
      setDangGuiDanhGia(false);
    }
  }

  const danhSachAnhChiTiet = useMemo(() => {
    if (!tinDangChon) return [];
    if (Array.isArray(tinDangChon.hinhAnh) && tinDangChon.hinhAnh.length > 0) {
      return tinDangChon.hinhAnh;
    }
    return tinDangChon.anhDaiDien ? [tinDangChon.anhDaiDien] : [];
  }, [tinDangChon]);

  const tienIchPhong = useMemo(() => {
    if (!tinDangChon) return [];
    const nguon = tinDangChon.tienIch || tinDangChon.phong?.tienIch || [];
    return Array.isArray(nguon) ? nguon : [];
  }, [tinDangChon]);

  const diemTrungBinh = useMemo(() => {
    if (dsDanhGia.length === 0) return null;
    const tong = dsDanhGia.reduce((sum, dg) => sum + (Number(dg.soSao) || 5), 0);
    return (tong / dsDanhGia.length).toFixed(1);
  }, [dsDanhGia]);

  return (
    <section className="page">
      <PageHeader
        title="Tìm phòng trọ"
        description="Tra cứu phòng còn trống theo khu vực, giá thuê, diện tích và đặt lịch hẹn xem phòng trực tiếp với chủ trọ."
        actions={
          <>
            <Link to="/khach-thue/o-ghep" className="button">
              <Users size={14} /> Tìm bạn ở ghép
            </Link>
            <button type="button" className="button" onClick={taiDanhSachTin} disabled={dangTaiList}>
              <RotateCcw size={14} /> Làm mới
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

      {/* Thanh tìm kiếm & lọc theo giá, diện tích */}
      <div className="tp-filter-bar">
        <div className="tp-search-box">
          <Search size={15} className="tp-search-icon" />
          <input
            type="text"
            className="field tp-search-input"
            placeholder="Tìm theo tên phòng, đường, khu vực, dãy trọ..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
        </div>

        <select
          className="select tp-filter-select"
          value={locGia}
          onChange={(e) => setLocGia(e.target.value)}
        >
          <option value="TAT_CA">Tất cả mức giá</option>
          <option value="DUOI_2TR">Dưới 2 triệu / tháng</option>
          <option value="2_DEN_3_5TR">2 - 3.5 triệu / tháng</option>
          <option value="TREN_3_5TR">Trên 3.5 triệu / tháng</option>
        </select>

        <select
          className="select tp-filter-select"
          value={locDienTich}
          onChange={(e) => setLocDienTich(e.target.value)}
        >
          <option value="TAT_CA">Tất cả diện tích</option>
          <option value="DUOI_20">Dưới 20 m²</option>
          <option value="20_DEN_30">20 - 30 m²</option>
          <option value="TREN_30">Trên 30 m²</option>
        </select>

        <select
          className="select tp-filter-select"
          value={sapXep}
          onChange={(e) => setSapXep(e.target.value)}
        >
          <option value="MOI_NHAT">Mới đăng nhất</option>
          <option value="GIA_TANG">Giá thấp đến cao</option>
          <option value="GIA_GIAM">Giá cao đến thấp</option>
        </select>

        <span className="tp-count-pill">{danhSachLoc.length} phòng còn trống</span>
      </div>

      {/* Bố cục 2 cột: Danh sách bên trái & Chi tiết bên phải */}
      {dangTaiList ? (
        <div className="panel" style={{ padding: 32, textAlign: 'center', color: '#64758d' }}>
          Đang tải danh sách phòng trọ còn trống...
        </div>
      ) : danhSachLoc.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="Không tìm thấy phòng trống phù hợp"
            detail="Thử đổi từ khóa tìm kiếm hoặc nới lỏng bộ lọc giá và diện tích để xem các phòng đang trống."
            action={
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  setTuKhoa('');
                  setLocGia('TAT_CA');
                  setLocDienTich('TAT_CA');
                }}
              >
                Xóa bộ lọc
              </button>
            }
          />
        </section>
      ) : (
        <div className="tp-layout">
          {/* Cột trái: Danh sách phòng */}
          <aside className="tp-list-col" aria-label="Danh sách phòng tìm được">
            {danhSachLoc.map((tin) => {
              const tinId = idOf(tin);
              const dangChon = tinDangChon && idOf(tinDangChon) === tinId;
              const anhNho = Array.isArray(tin.hinhAnh) ? tin.hinhAnh[0] : tin.anhDaiDien;
              const gia = Number(tin.giaThue || tin.phong?.giaThue) || 0;
              const dienTich = tin.dienTich || tin.phong?.dienTich;
              const diaChi = tin.diaChi || tin.dayTro?.diaChi || tin.khuVuc || 'Khu vực trung tâm';

              return (
                <button
                  type="button"
                  key={tinId}
                  className={`tp-item-card${dangChon ? ' is-selected' : ''}`}
                  onClick={() => chonTinDang(tin)}
                >
                  <div className="tp-item-thumb">
                    {anhNho ? (
                      <img src={layUrlAnh(anhNho)} alt={tin.tieuDe} />
                    ) : (
                      <House size={26} strokeWidth={1.6} />
                    )}
                  </div>

                  <div className="tp-item-info">
                    <h3 className="tp-item-title">{tin.tieuDe || 'Phòng trọ cho thuê'}</h3>
                    <div className="tp-item-price">
                      {gia > 0 ? `${formatMoney(gia)}/tháng` : 'Thỏa thuận'}
                    </div>
                    <div className="tp-item-meta">
                      {dienTich ? `${dienTich} m² · ` : ''}
                      {diaChi}
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Cột phải: Chi tiết tin đăng, Đặt lịch & Đánh giá */}
          {tinDangChon && (
            <section className="tp-detail-panel">
              {/* Bộ sưu tập ảnh phòng */}
              <div className="tp-gallery">
                <div className="tp-main-photo">
                  {anhDangXem ? (
                    <img src={layUrlAnh(anhDangXem)} alt={tinDangChon.tieuDe} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <House size={48} strokeWidth={1.5} />
                      <div style={{ fontSize: 13, marginTop: 6, color: '#64758d' }}>
                        Chưa có hình ảnh chi tiết cho tin đăng này
                      </div>
                    </div>
                  )}
                </div>

                {danhSachAnhChiTiet.length > 1 && (
                  <div className="tp-thumb-strip">
                    {danhSachAnhChiTiet.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className={`tp-thumb-btn${anhDangXem === url ? ' is-active' : ''}`}
                        onClick={() => setAnhDangXem(url)}
                      >
                        <img src={layUrlAnh(url)} alt={`Ảnh ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="tp-detail-body">
                {/* Tiêu đề, địa chỉ & giá thuê */}
                <div className="tp-detail-head">
                  <div>
                    <h1 className="tp-detail-title">
                      {tinDangChon.tieuDe || 'Chi tiết phòng trọ'}
                    </h1>
                    <div className="tp-detail-address">
                      <MapPin size={15} color="#2563d9" />
                      <span>
                        {tinDangChon.diaChi ||
                          tinDangChon.dayTro?.diaChi ||
                          tinDangChon.khuVuc ||
                          'Đang cập nhật địa chỉ cụ thể'}
                      </span>
                    </div>
                  </div>

                  <div className="tp-detail-price-box">
                    <div className="tp-detail-price">
                      {Number(tinDangChon.giaThue || tinDangChon.phong?.giaThue) > 0
                        ? formatMoney(tinDangChon.giaThue || tinDangChon.phong?.giaThue)
                        : 'Liên hệ'}
                      <small> / tháng</small>
                    </div>
                    {diemTrungBinh && (
                      <div style={{ fontSize: 12.5, color: '#365170', marginTop: 4 }}>
                        <Star
                          size={13}
                          fill="#ed7622"
                          color="#ed7622"
                          style={{ verticalAlign: '-2px', marginRight: 3 }}
                        />
                        <strong>{diemTrungBinh}</strong> ({dsDanhGia.length} đánh giá)
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông số cơ bản */}
                <div className="tp-specs-row">
                  {(tinDangChon.dienTich || tinDangChon.phong?.dienTich) && (
                    <span className="tp-spec-chip">
                      <Maximize2 size={14} color="#2563d9" />
                      Diện tích: {tinDangChon.dienTich || tinDangChon.phong?.dienTich} m²
                    </span>
                  )}
                  {tinDangChon.dayTro?.tenDayTro && (
                    <span className="tp-spec-chip">
                      <Building2 size={14} color="#2563d9" />
                      Dãy trọ: {tinDangChon.dayTro.tenDayTro}
                    </span>
                  )}
                  <Link to="/khach-thue/o-ghep" className="button">
                    <Users size={14} /> Tìm bạn ở ghép cho phòng này
                  </Link>
                </div>

                {/* Mô tả chi tiết */}
                <div className="tp-section-box">
                  <h2 className="tp-section-title">Mô tả chi tiết phòng trọ</h2>
                  <p className="tp-desc-text">
                    {tinDangChon.moTa ||
                      'Phòng sạch sẽ, thoáng mát, giờ giấc tự do, an ninh đảm bảo. Liên hệ hoặc đặt lịch xem phòng trực tiếp bên dưới.'}
                  </p>
                </div>

                {/* Tiện ích đi kèm */}
                {tienIchPhong.length > 0 && (
                  <div className="tp-section-box">
                    <h2 className="tp-section-title">Tiện nghi & Nội thất</h2>
                    <div className="tp-amenities">
                      {tienIchPhong.map((ti, idx) => (
                        <span className="tp-amenity-pill" key={idx}>
                          {ti}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Khu vực Đặt lịch hẹn xem phòng (API của Hùng) */}
                <div className="tp-section-box">
                  <div className="tp-booking-box">
                    <h2 className="tp-section-title" style={{ color: '#174ea6' }}>
                      <CalendarClock size={17} /> Đặt lịch hẹn xem phòng / Để lại thông tin liên hệ
                    </h2>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64758d' }}>
                      Để lại thông tin liên hệ và khung giờ thuận tiện để chủ trọ sắp xếp mở cửa, tư vấn chi tiết.
                    </p>

                    <form onSubmit={xuLyDatLichXem}>
                      <div className="form-grid form-grid--two">
                        <label className="field-label">
                          Họ và tên người xem *
                          <input
                            className="field"
                            type="text"
                            required
                            placeholder="Nguyễn Văn A"
                            value={formLichXem.hoTenKhach}
                            onChange={(e) =>
                              setFormLichXem((p) => ({ ...p, hoTenKhach: e.target.value }))
                            }
                          />
                        </label>

                        <label className="field-label">
                          Số điện thoại liên hệ *
                          <input
                            className="field"
                            type="tel"
                            required
                            placeholder="09xxxxxxxx"
                            value={formLichXem.soDienThoai}
                            onChange={(e) =>
                              setFormLichXem((p) => ({ ...p, soDienThoai: e.target.value }))
                            }
                          />
                        </label>

                        <label className="field-label">
                          Ngày & giờ dự kiến đến xem *
                          <input
                            className="field"
                            type="datetime-local"
                            required
                            value={formLichXem.thoiGianXem}
                            onChange={(e) =>
                              setFormLichXem((p) => ({ ...p, thoiGianXem: e.target.value }))
                            }
                          />
                        </label>

                        <label className="field-label">
                          Ghi chú cho chủ trọ
                          <input
                            className="field"
                            type="text"
                            placeholder="Ví dụ: Mình đi 2 người, đến cổng gọi điện..."
                            value={formLichXem.ghiChu}
                            onChange={(e) =>
                              setFormLichXem((p) => ({ ...p, ghiChu: e.target.value }))
                            }
                          />
                        </label>
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="button button--warm"
                          disabled={dangDatLich}
                        >
                          <CheckCircle2 size={14} /> Gửi thông tin đặt lịch xem
                        </button>
                        <SavingLabel active={dangDatLich} children="Đang gửi lịch..." />
                      </div>
                    </form>
                  </div>
                </div>

                {/* Khu vực Đánh giá & Nhận xét phòng (API của Hùng) */}
                <div className="tp-section-box">
                  <h2 className="tp-section-title">
                    <MessageSquarePlus size={17} color="#2563d9" /> Đánh giá từ người thuê (
                    {dsDanhGia.length})
                  </h2>

                  <form onSubmit={xuLyGuiDanhGia} style={{ marginBottom: 14 }}>
                    <div className="form-grid form-grid--two">
                      <label className="field-label">
                        Mức độ hài lòng
                        <select
                          className="select"
                          value={formDanhGia.soSao}
                          onChange={(e) =>
                            setFormDanhGia((p) => ({ ...p, soSao: Number(e.target.value) }))
                          }
                        >
                          <option value={5}>5 sao - Rất hài lòng</option>
                          <option value={4}>4 sao - Tốt</option>
                          <option value={3}>3 sao - Bình thường</option>
                          <option value={2}>2 sao - Chưa hài lòng</option>
                          <option value={1}>1 sao - Kém</option>
                        </select>
                      </label>

                      <label className="field-label">
                        Nhận xét của bạn
                        <input
                          className="field"
                          type="text"
                          placeholder="Chia sẻ trải nghiệm thực tế về phòng trọ này..."
                          value={formDanhGia.noiDung}
                          onChange={(e) =>
                            setFormDanhGia((p) => ({ ...p, noiDung: e.target.value }))
                          }
                        />
                      </label>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="button button--primary"
                        disabled={dangGuiDanhGia}
                      >
                        <Send size={14} /> Gửi đánh giá
                      </button>
                      <SavingLabel active={dangGuiDanhGia} children="Đang gửi..." />
                    </div>
                  </form>

                  {dangTaiDanhGia ? (
                    <div className="cell-subtitle">Đang tải đánh giá...</div>
                  ) : dsDanhGia.length === 0 ? (
                    <div className="cell-subtitle">
                      Chưa có đánh giá nào cho phòng này. Hãy là người đầu tiên chia sẻ nhận xét!
                    </div>
                  ) : (
                    <div className="tp-review-list">
                      {dsDanhGia.map((dg) => (
                        <div className="tp-review-item" key={idOf(dg)}>
                          <div className="tp-review-top">
                            <strong style={{ fontSize: 13.5, color: '#1c2b43' }}>
                              {dg.nguoiDanhGia?.hoTen || 'Khách thuê StaySync'}
                            </strong>
                            <span className="tp-stars">
                              {Array.from({ length: Number(dg.soSao) || 5 }, (_, i) => (
                                <Star key={i} size={13} fill="#ed7622" color="#ed7622" />
                              ))}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0', fontSize: 13.5, color: '#365170' }}>
                            {dg.noiDung}
                          </p>
                          <div className="cell-subtitle">
                            {dg.createdAt ? formatDate(dg.createdAt) : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}