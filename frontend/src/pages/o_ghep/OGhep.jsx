import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  layDanhSachOGhepApi,
  layHoSoOGhepCuaToiApi,
  taoHoSoOGhepApi,
  capNhatHoSoOGhepCuaToiApi,
  xoaHoSoOGhepCuaToiApi,
} from '../../services/o_ghep_service.js';
import {
  EmptyState,
  LoadingRows,
  Notice,
  PageHeader,
  SavingLabel,
  Status,
} from '../../components/WorkspaceUI.jsx';
import { errorMessage, formatDate, formatMoney, idOf } from '../../utils/format.js';
import './OGhep.css';

const FORM_MAC_DINH = {
  tieuDe: '',
  khuVucMongMuon: '',
  nganSachToiDa: '',
  gioiTinhUuTien: 'KHONG_YEU_CAU',
  ngayDuKienO: '',
  thoiQuenSinhHoat: '',
  moTaBanThan: '',
  soDienThoaiLienHe: '',
  trangThai: 'DANG_TIM',
};

const GIOI_TINH_LABELS = {
  NAM: 'Ưu tiên Nam',
  NU: 'Ưu tiên Nữ',
  KHONG_YEU_CAU: 'Không yêu cầu giới tính',
};

function chuyenSangForm(item, user) {
  if (!item) {
    return {
      ...FORM_MAC_DINH,
      soDienThoaiLienHe: user?.soDienThoai || '',
    };
  }
  return {
    ...FORM_MAC_DINH,
    ...item,
    nganSachToiDa: item.nganSachToiDa || '',
    ngayDuKienO: item.ngayDuKienO ? new Date(item.ngayDuKienO).toISOString().slice(0, 10) : '',
    thoiQuenSinhHoat: Array.isArray(item.thoiQuenSinhHoat)
      ? item.thoiQuenSinhHoat.join(', ')
      : item.thoiQuenSinhHoat || '',
    soDienThoaiLienHe: item.soDienThoaiLienHe || user?.soDienThoai || '',
  };
}

export default function OGhep() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Danh sách cộng đồng & hồ sơ cá nhân
  const [danhSach, setDanhSach] = useState([]);
  const [hoSoCuaToi, setHoSoCuaToi] = useState(null);
  const [dangTai, setDangTai] = useState(true);

  // Bộ lọc tìm kiếm
  const [tuKhoa, setTuKhoa] = useState('');
  const [locGioiTinh, setLocGioiTinh] = useState('TAT_CA');
  const [locNganSach, setLocNganSach] = useState('TAT_CA');

  // Form đăng / cập nhật hồ sơ ở ghép
  const [moForm, setMoForm] = useState(false);
  const [form, setForm] = useState({ ...FORM_MAC_DINH });
  const [dangLuu, setDangLuu] = useState(false);

  // Hiển thị số điện thoại liên hệ của từng thẻ
  const [hienLienHeIds, setHienLienHeIds] = useState({});

  // Thông báo
  const [loi, setLoi] = useState('');
  const [thanhCong, setThanhCong] = useState('');

  // Tải danh sách ở ghép công khai; chỉ tải hồ sơ cá nhân nếu đã đăng nhập
  async function taiDuLieu() {
    setDangTai(true);
    setLoi('');

    try {
      const listRes = await layDanhSachOGhepApi({ limit: 200 });
      const duLieu = listRes.data?.items || listRes.data || [];
      setDanhSach(Array.isArray(duLieu) ? duLieu : []);
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể tải danh sách tìm bạn ở ghép.'));
    }

    if (user) {
      try {
        const mineRes = await layHoSoOGhepCuaToiApi();
        const hoSo = mineRes.data?.hoSo || mineRes.data || null;
        setHoSoCuaToi(hoSo && Object.keys(hoSo).length > 0 ? hoSo : null);
      } catch {
        setHoSoCuaToi(null);
      }
    } else {
      setHoSoCuaToi(null);
    }

    setDangTai(false);
  }

  useEffect(() => {
    taiDuLieu();
  }, [user]);

  // Lọc danh sách theo từ khóa, giới tính và ngân sách
  const danhSachLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase();
    return danhSach.filter((item) => {
      if (locGioiTinh !== 'TAT_CA' && item.gioiTinhUuTien !== locGioiTinh) {
        return false;
      }
      if (locNganSach !== 'TAT_CA') {
        const mucGia = Number(item.nganSachToiDa) || 0;
        if (locNganSach === 'DUOI_2TR' && mucGia > 2000000) return false;
        if (locNganSach === '2_DEN_3_5TR' && (mucGia < 2000000 || mucGia > 3500000)) return false;
        if (locNganSach === 'TREN_3_5TR' && mucGia <= 3500000) return false;
      }
      if (!kw) return true;

      const chuoiTim = [
        item.tieuDe,
        item.khuVucMongMuon,
        item.moTaBanThan,
        item.nguoiDang?.hoTen,
        Array.isArray(item.thoiQuenSinhHoat)
          ? item.thoiQuenSinhHoat.join(' ')
          : item.thoiQuenSinhHoat,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return chuoiTim.includes(kw);
    });
  }, [danhSach, tuKhoa, locGioiTinh, locNganSach]);

  // Chưa đăng nhập thì chuyển sang trang Đăng nhập; đã đăng nhập thì mở form
  function batDauChinhSua() {
    if (!user) {
      navigate('/dang-nhap');
      return;
    }
    setForm(chuyenSangForm(hoSoCuaToi, user));
    setMoForm(true);
    setLoi('');
    setThanhCong('');
  }

  function capNhatTruong(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Lưu hồ sơ ở ghép (Tạo mới nếu chưa có, Cập nhật nếu đã có)
  async function xuLyLuuHoSo(e) {
    e.preventDefault();
    if (!user) {
      navigate('/dang-nhap');
      return;
    }
    if (!form.tieuDe.trim() || !form.khuVucMongMuon.trim()) {
      setLoi('Vui lòng nhập tiêu đề tin và khu vực mong muốn ở ghép.');
      return;
    }

    setDangLuu(true);
    setLoi('');
    setThanhCong('');

    const payload = {
      tieuDe: form.tieuDe.trim(),
      khuVucMongMuon: form.khuVucMongMuon.trim(),
      nganSachToiDa: Number(form.nganSachToiDa) || 0,
      gioiTinhUuTien: form.gioiTinhUuTien,
      ngayDuKienO: form.ngayDuKienO || null,
      thoiQuenSinhHoat: form.thoiQuenSinhHoat
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      moTaBanThan: form.moTaBanThan.trim(),
      soDienThoaiLienHe: form.soDienThoaiLienHe.trim(),
      trangThai: form.trangThai,
    };

    try {
      if (hoSoCuaToi) {
        await capNhatHoSoOGhepCuaToiApi(payload);
        setThanhCong('Đã cập nhật hồ sơ tìm bạn ở ghép của bạn.');
      } else {
        await taoHoSoOGhepApi(payload);
        setThanhCong('Đã đăng tin tìm bạn ở ghép thành công.');
      }
      setMoForm(false);
      await taiDuLieu();
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể lưu hồ sơ ở ghép.'));
    } finally {
      setDangLuu(false);
    }
  }

  // Gỡ / xóa hồ sơ ở ghép cá nhân
  async function xuLyXoaHoSo() {
    if (!window.confirm('Bạn có chắc muốn gỡ tin tìm bạn ở ghép hiện tại?')) return;
    setLoi('');
    setThanhCong('');
    try {
      await xoaHoSoOGhepCuaToiApi();
      setThanhCong('Đã gỡ hồ sơ ở ghép của bạn.');
      setHoSoCuaToi(null);
      await taiDuLieu();
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể gỡ hồ sơ ở ghép.'));
    }
  }

  function batTatLienHe(id) {
    setHienLienHeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <section className="page">
      <PageHeader
        title="Tìm bạn ở ghép"
        description="Đăng hồ sơ nhu cầu chia sẻ phòng trọ và kết nối với sinh viên, người đi làm phù hợp khu vực."
        actions={
          <>
            <button type="button" className="button" onClick={taiDuLieu} disabled={dangTai}>
              <RotateCcw size={14} /> Tải lại
            </button>
            <button type="button" className="button button--warm" onClick={batDauChinhSua}>
              {hoSoCuaToi ? <Pencil size={14} /> : <Plus size={14} />}
              {hoSoCuaToi ? 'Sửa tin của tôi' : 'Đăng tin tìm ở ghép'}
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

      {/* Thẻ hiển thị trạng thái hồ sơ cá nhân của người dùng hiện tại */}
      {user && hoSoCuaToi && !moForm && (
        <div className="og-my-card">
          <div className="og-my-info">
            <span className="og-my-badge">
              <Sparkles size={13} /> Hồ sơ ở ghép của bạn
            </span>
            <h2 className="og-my-title">{hoSoCuaToi.tieuDe}</h2>
            <div className="og-my-meta">
              Khu vực: <strong>{hoSoCuaToi.khuVucMongMuon}</strong>
              {Number(hoSoCuaToi.nganSachToiDa) > 0 && (
                <>
                  {' '}
                  · Ngân sách tối đa: <strong>{formatMoney(hoSoCuaToi.nganSachToiDa)}/tháng</strong>
                </>
              )}
              {' · '}
              <Status
                value={hoSoCuaToi.trangThai === 'DANG_TIM' ? 'HOAT_DONG' : 'NGUNG_HOAT_DONG'}
                label={hoSoCuaToi.trangThai === 'DANG_TIM' ? 'Đang tìm bạn' : 'Tạm ẩn tin'}
              />
            </div>
          </div>

          <div className="og-my-actions">
            <button type="button" className="button button--primary" onClick={batDauChinhSua}>
              <Pencil size={14} /> Chỉnh sửa
            </button>
            <button type="button" className="button" onClick={xuLyXoaHoSo}>
              <Trash2 size={14} /> Gỡ tin
            </button>
          </div>
        </div>
      )}

      {/* Panel biểu mẫu đăng / chỉnh sửa hồ sơ ở ghép */}
      {user && moForm && (
        <section className="panel editor-panel">
          <div className="panel__heading">
            <div>
              <h2>{hoSoCuaToi ? 'Cập nhật hồ sơ ở ghép' : 'Đăng hồ sơ tìm bạn ở ghép'}</h2>
              <p>Chia sẻ khu vực, mức chi phí dự kiến và thói quen sinh hoạt để tìm người hợp gu.</p>
            </div>
            <button
              type="button"
              className="icon-action"
              aria-label="Đóng"
              onClick={() => setMoForm(false)}
            >
              <X size={16} />
            </button>
          </div>

          <form className="panel__body editor-form" onSubmit={xuLyLuuHoSo}>
            <div className="form-grid form-grid--two">
              <label className="field-label form-span-two">
                Tiêu đề tin ở ghép *
                <input
                  className="field"
                  type="text"
                  required
                  placeholder="Ví dụ: Nam sinh viên PTIT tìm 1 bạn ở ghép gần Học viện / Hà Đông"
                  value={form.tieuDe}
                  onChange={(e) => capNhatTruong('tieuDe', e.target.value)}
                />
              </label>

              <label className="field-label">
                Khu vực mong muốn *
                <input
                  className="field"
                  type="text"
                  required
                  placeholder="Ví dụ: Mỗ Lao, Văn Quán, Triều Khúc..."
                  value={form.khuVucMongMuon}
                  onChange={(e) => capNhatTruong('khuVucMongMuon', e.target.value)}
                />
              </label>

              <label className="field-label">
                Ngân sách tối đa / người (VNĐ/tháng)
                <input
                  className="field"
                  type="number"
                  min={0}
                  step={100000}
                  placeholder="2500000"
                  value={form.nganSachToiDa}
                  onChange={(e) => capNhatTruong('nganSachToiDa', e.target.value)}
                />
              </label>

              <label className="field-label">
                Yêu cầu giới tính bạn ở ghép
                <select
                  className="select"
                  value={form.gioiTinhUuTien}
                  onChange={(e) => capNhatTruong('gioiTinhUuTien', e.target.value)}
                >
                  <option value="KHONG_YEU_CAU">Không yêu cầu</option>
                  <option value="NAM">Nam</option>
                  <option value="NU">Nữ</option>
                </select>
              </label>

              <label className="field-label">
                Ngày dự kiến chuyển vào
                <input
                  className="field"
                  type="date"
                  value={form.ngayDuKienO}
                  onChange={(e) => capNhatTruong('ngayDuKienO', e.target.value)}
                />
              </label>

              <label className="field-label">
                Số điện thoại / Zalo liên hệ
                <input
                  className="field"
                  type="tel"
                  placeholder="09xxxxxxxx"
                  value={form.soDienThoaiLienHe}
                  onChange={(e) => capNhatTruong('soDienThoaiLienHe', e.target.value)}
                />
              </label>

              <label className="field-label">
                Trạng thái hiển thị tin
                <select
                  className="select"
                  value={form.trangThai}
                  onChange={(e) => capNhatTruong('trangThai', e.target.value)}
                >
                  <option value="DANG_TIM">Đang tìm bạn ở ghép</option>
                  <option value="TAM_AN">Tạm ẩn tin</option>
                </select>
              </label>

              <label className="field-label form-span-two">
                Thói quen sinh hoạt (cách nhau bằng dấu phẩy)
                <input
                  className="field"
                  type="text"
                  placeholder="Ngủ sớm, sạch sẽ, không hút thuốc, nấu ăn tại phòng"
                  value={form.thoiQuenSinhHoat}
                  onChange={(e) => capNhatTruong('thoiQuenSinhHoat', e.target.value)}
                />
              </label>

              <label className="field-label form-span-two">
                Giới thiệu bản thân & yêu cầu thêm
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Giới thiệu ngắn gọn về trường học/công việc, tính cách và mong muốn về phòng trọ..."
                  value={form.moTaBanThan}
                  onChange={(e) => capNhatTruong('moTaBanThan', e.target.value)}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="button button--primary" disabled={dangLuu}>
                <Save size={14} /> {hoSoCuaToi ? 'Lưu thay đổi' : 'Đăng tin ở ghép'}
              </button>
              <button type="button" className="button" onClick={() => setMoForm(false)}>
                Hủy
              </button>
              <SavingLabel active={dangLuu} />
            </div>
          </form>
        </section>
      )}

      {/* Thanh bộ lọc tìm kiếm */}
      <div className="og-toolbar">
        <div className="og-search-box">
          <Search size={15} className="og-search-icon" />
          <input
            type="text"
            className="field og-search-input"
            placeholder="Tìm theo khu vực (Mỗ Lao, Hà Đông...), thói quen, tiêu đề..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
        </div>

        <select
          className="select og-filter-select"
          value={locGioiTinh}
          onChange={(e) => setLocGioiTinh(e.target.value)}
        >
          <option value="TAT_CA">Tất cả giới tính</option>
          <option value="NAM">Nam</option>
          <option value="NU">Nữ</option>
          <option value="KHONG_YEU_CAU">Không yêu cầu</option>
        </select>

        <select
          className="select og-filter-select"
          value={locNganSach}
          onChange={(e) => setLocNganSach(e.target.value)}
        >
          <option value="TAT_CA">Mọi mức ngân sách</option>
          <option value="DUOI_2TR">Dưới 2 triệu / người</option>
          <option value="2_DEN_3_5TR">2 - 3.5 triệu / người</option>
          <option value="TREN_3_5TR">Trên 3.5 triệu / người</option>
        </select>
      </div>

      {/* Danh sách hồ sơ tìm bạn ở ghép */}
      <section className="panel">
        <div className="panel__heading">
          <div>
            <h2>Danh sách người đang tìm bạn ở ghép</h2>
            <p>{danhSachLoc.length} hồ sơ phù hợp đang mở kết nối.</p>
          </div>
          <Users size={17} color="#2563d9" />
        </div>

        <div className="panel__body--flush">
          {dangTai ? (
            <LoadingRows columns={4} rows={4} />
          ) : danhSachLoc.length === 0 ? (
            <EmptyState
              title="Chưa tìm thấy hồ sơ ở ghép phù hợp"
              detail={
                tuKhoa || locGioiTinh !== 'TAT_CA' || locNganSach !== 'TAT_CA'
                  ? 'Thử nới lỏng bộ lọc khu vực hoặc mức ngân sách để xem thêm hồ sơ.'
                  : 'Chưa có tin tìm bạn ở ghép nào. Hãy là người đầu tiên đăng tin!'
              }
              action={
                !hoSoCuaToi && (
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={batDauChinhSua}
                  >
                    <UserPlus size={14} /> Đăng tin tìm ở ghép
                  </button>
                )
              }
            />
          ) : (
            <div className="og-grid">
              {danhSachLoc.map((item) => {
                const itemId = idOf(item);
                const tenNguoiDang = item.nguoiDang?.hoTen || 'Thành viên StaySync';
                const chuCaiDau =
                  Array.from(String(tenNguoiDang).trim())[0]?.toLocaleUpperCase('vi-VN') || 'U';
                const thoiQuen = Array.isArray(item.thoiQuenSinhHoat)
                  ? item.thoiQuenSinhHoat
                  : item.thoiQuenSinhHoat
                    ? String(item.thoiQuenSinhHoat).split(',').map((s) => s.trim())
                    : [];
                const dangHienSdt = !!hienLienHeIds[itemId];
                const sdt = item.soDienThoaiLienHe || item.nguoiDang?.soDienThoai;

                return (
                  <article className="og-card" key={itemId}>
                    <div>
                      <div className="og-card-top">
                        <div className="og-user-box">
                          <span className="og-avatar">{chuCaiDau}</span>
                          <div>
                            <div className="og-user-name">{tenNguoiDang}</div>
                            <div className="og-user-sub">
                              {item.createdAt ? formatDate(item.createdAt) : 'Mới đăng'}
                            </div>
                          </div>
                        </div>
                        <Status
                          value={item.trangThai === 'DANG_TIM' ? 'HOAT_DONG' : 'CHO_XU_LY'}
                          label={item.trangThai === 'DANG_TIM' ? 'Đang tìm' : 'Tạm ẩn'}
                        />
                      </div>

                      <h3 className="og-card-title" style={{ marginTop: 10 }}>
                        {item.tieuDe}
                      </h3>

                      {item.moTaBanThan && (
                        <p className="og-card-desc" style={{ marginTop: 6 }}>
                          {item.moTaBanThan}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="og-tags" style={{ marginBottom: 10 }}>
                        {item.khuVucMongMuon && (
                          <span className="og-tag">
                            <MapPin size={12} /> {item.khuVucMongMuon}
                          </span>
                        )}
                        {Number(item.nganSachToiDa) > 0 && (
                          <span className="og-tag og-tag--budget">
                            Tối đa {formatMoney(item.nganSachToiDa)}
                          </span>
                        )}
                        {item.gioiTinhUuTien && (
                          <span className="og-tag">
                            {GIOI_TINH_LABELS[item.gioiTinhUuTien] || item.gioiTinhUuTien}
                          </span>
                        )}
                        {item.ngayDuKienO && (
                          <span className="og-tag">
                            <Calendar size={12} /> Vào ở: {formatDate(item.ngayDuKienO)}
                          </span>
                        )}
                        {thoiQuen.slice(0, 3).map((tq, idx) => (
                          <span className="og-tag" key={idx}>
                            {tq}
                          </span>
                        ))}
                      </div>

                      <div className="og-card-footer">
                        {dangHienSdt ? (
                          <span className="og-contact-text">
                            <Phone size={13} style={{ marginRight: 4, verticalAlign: '-2px' }} />
                            {sdt || 'Chưa cung cấp SĐT'}
                          </span>
                        ) : (
                          <span className="cell-subtitle">Bấm để xem SĐT / Zalo</span>
                        )}

                        <button
                          type="button"
                          className="button button--primary"
                          onClick={() => batTatLienHe(itemId)}
                        >
                          {dangHienSdt ? 'Ẩn liên hệ' : 'Liên hệ ở ghép'}
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
    </section>
  );
}