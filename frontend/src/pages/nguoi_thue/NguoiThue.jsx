import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RotateCcw, Save, Search, Trash2, Users, X } from 'lucide-react';
import {
  layDanhSachNguoiThueApi,
  taoNguoiThueApi,
  capNhatNguoiThueApi,
  xoaNguoiThueApi,
} from '../../services/nguoi_thue_service.js';
import {
  EmptyState,
  LoadingRows,
  Notice,
  PageHeader,
  SavingLabel,
  Status,
} from '../../components/WorkspaceUI.jsx';
import { errorMessage, formatDate, idOf } from '../../utils/format.js';
import './NguoiThue.css';

const FORM_MAC_DINH = {
  hoTen: '',
  soDienThoai: '',
  email: '',
  cccd: '',
  ngaySinh: '',
  gioiTinh: 'NAM',
  queQuan: '',
  ngheNghiep: '',
  trangThaiTamTru: 'DA_DANG_KY',
  ghiChu: '',
};

const TRANG_THAI_TAM_TRU = {
  DA_DANG_KY: 'Đã đăng ký tạm trú',
  CHUA_DANG_KY: 'Chưa đăng ký tạm trú',
  HET_HAN: 'Hết hạn tạm trú',
};

function chuyenSangForm(item) {
  if (!item) return { ...FORM_MAC_DINH };
  return {
    ...FORM_MAC_DINH,
    ...item,
    ngaySinh: item.ngaySinh ? new Date(item.ngaySinh).toISOString().slice(0, 10) : '',
    trangThaiTamTru: item.trangThaiTamTru || 'DA_DANG_KY',
  };
}

export default function NguoiThue() {
  // Danh sách & trạng thái tải dữ liệu
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // Bộ lọc tìm kiếm
  const [tuKhoa, setTuKhoa] = useState('');
  const [locTamTru, setLocTamTru] = useState('TAT_CA');

  // Form thêm / cập nhật người thuê
  const [moForm, setMoForm] = useState(false);
  const [dangSuaId, setDangSuaId] = useState('');
  const [form, setForm] = useState({ ...FORM_MAC_DINH });
  const [dangLuu, setDangLuu] = useState(false);

  // Thông báo
  const [loi, setLoi] = useState('');
  const [thanhCong, setThanhCong] = useState('');

  // Tải danh sách người thuê từ Backend
  async function taiDanhSach() {
    setDangTai(true);
    setLoi('');
    try {
      const res = await layDanhSachNguoiThueApi({ limit: 200 });
      const duLieu = res.data?.items || res.data || [];
      setDanhSach(Array.isArray(duLieu) ? duLieu : []);
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể tải danh sách người thuê.'));
    } finally {
      setDangTai(false);
    }
  }

  useEffect(() => {
    taiDanhSach();
  }, []);

  // Lọc dữ liệu hiển thị theo từ khóa và trạng thái tạm trú
  const danhSachLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase();
    return danhSach.filter((item) => {
      const khopTrangThai =
        locTamTru === 'TAT_CA' || (item.trangThaiTamTru || 'CHUA_DANG_KY') === locTamTru;
      if (!khopTrangThai) return false;
      if (!kw) return true;

      const chuoiTim = [
        item.hoTen,
        item.soDienThoai,
        item.cccd,
        item.email,
        item.queQuan,
        item.phong?.tenPhong,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return chuoiTim.includes(kw);
    });
  }, [danhSach, tuKhoa, locTamTru]);

  // Mở form thêm mới hoặc chỉnh sửa
  function batDauNhap(item = null) {
    setDangSuaId(item ? idOf(item) : '');
    setForm(chuyenSangForm(item));
    setMoForm(true);
    setLoi('');
    setThanhCong('');
  }

  function capNhatTruong(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Lưu thông tin người thuê (Tạo mới hoặc Cập nhật)
  async function xuLyLuu(e) {
    e.preventDefault();
    if (!form.hoTen.trim()) {
      setLoi('Vui lòng nhập họ và tên người thuê.');
      return;
    }
    if (!form.soDienThoai.trim()) {
      setLoi('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }

    setDangLuu(true);
    setLoi('');
    setThanhCong('');

    const payload = {
      hoTen: form.hoTen.trim(),
      soDienThoai: form.soDienThoai.trim(),
      email: form.email.trim() || undefined,
      cccd: form.cccd.trim() || undefined,
      ngaySinh: form.ngaySinh || null,
      gioiTinh: form.gioiTinh,
      queQuan: form.queQuan.trim() || undefined,
      ngheNghiep: form.ngheNghiep.trim() || undefined,
      trangThaiTamTru: form.trangThaiTamTru,
      ghiChu: form.ghiChu.trim() || undefined,
    };

    try {
      if (dangSuaId) {
        await capNhatNguoiThueApi(dangSuaId, payload);
        setThanhCong('Đã cập nhật hồ sơ người thuê.');
      } else {
        await taoNguoiThueApi(payload);
        setThanhCong('Đã thêm hồ sơ người thuê mới.');
      }
      setMoForm(false);
      await taiDanhSach();
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể lưu thông tin người thuê.'));
    } finally {
      setDangLuu(false);
    }
  }

  // Xóa hồ sơ người thuê
  async function xuLyXoa(item) {
    const id = idOf(item);
    if (!id) return;
    if (!window.confirm(`Xóa hồ sơ người thuê "${item.hoTen}"?`)) return;

    setLoi('');
    setThanhCong('');
    try {
      await xoaNguoiThueApi(id);
      setThanhCong('Đã xóa hồ sơ người thuê.');
      await taiDanhSach();
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể xóa hồ sơ người thuê.'));
    }
  }

  return (
    <section className="page">
      <PageHeader
        title="Quản lý người thuê"
        description="Lưu trữ thông tin định danh CCCD, liên hệ và tình trạng đăng ký tạm trú của khách thuê."
        actions={
          <>
            <button type="button" className="button" onClick={taiDanhSach} disabled={dangTai}>
              <RotateCcw size={14} /> Tải lại
            </button>
            <button type="button" className="button button--warm" onClick={() => batDauNhap()}>
              <Plus size={14} /> Thêm người thuê
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

      {/* Panel biểu mẫu thêm / sửa người thuê */}
      {moForm && (
        <section className="panel editor-panel">
          <div className="panel__heading">
            <div>
              <h2>{dangSuaId ? 'Cập nhật hồ sơ người thuê' : 'Thêm người thuê mới'}</h2>
              <p>Điền đầy đủ thông tin cá nhân và giấy tờ tùy thân để phục vụ khai báo tạm trú.</p>
            </div>
            <button
              type="button"
              className="icon-action"
              aria-label="Đóng biểu mẫu"
              onClick={() => setMoForm(false)}
            >
              <X size={16} />
            </button>
          </div>

          <form className="panel__body editor-form" onSubmit={xuLyLuu}>
            <div className="form-grid form-grid--two">
              <label className="field-label">
                Họ và tên *
                <input
                  className="field"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={form.hoTen}
                  onChange={(e) => capNhatTruong('hoTen', e.target.value)}
                />
              </label>

              <label className="field-label">
                Số điện thoại *
                <input
                  className="field"
                  type="tel"
                  required
                  placeholder="09xxxxxxxx"
                  value={form.soDienThoai}
                  onChange={(e) => capNhatTruong('soDienThoai', e.target.value)}
                />
              </label>

              <label className="field-label">
                Số CCCD / CMND
                <input
                  className="field"
                  type="text"
                  maxLength={12}
                  placeholder="001200xxxxxx"
                  value={form.cccd}
                  onChange={(e) => capNhatTruong('cccd', e.target.value)}
                />
              </label>

              <label className="field-label">
                Email
                <input
                  className="field"
                  type="email"
                  placeholder="khachthue@email.com"
                  value={form.email}
                  onChange={(e) => capNhatTruong('email', e.target.value)}
                />
              </label>

              <label className="field-label">
                Ngày sinh
                <input
                  className="field"
                  type="date"
                  value={form.ngaySinh}
                  onChange={(e) => capNhatTruong('ngaySinh', e.target.value)}
                />
              </label>

              <label className="field-label">
                Giới tính
                <select
                  className="select"
                  value={form.gioiTinh}
                  onChange={(e) => capNhatTruong('gioiTinh', e.target.value)}
                >
                  <option value="NAM">Nam</option>
                  <option value="NU">Nữ</option>
                  <option value="KHAC">Khác</option>
                </select>
              </label>

              <label className="field-label">
                Quê quán / Địa chỉ thường trú
                <input
                  className="field"
                  type="text"
                  placeholder="Xã/Phường, Tỉnh/Thành phố"
                  value={form.queQuan}
                  onChange={(e) => capNhatTruong('queQuan', e.target.value)}
                />
              </label>

              <label className="field-label">
                Tình trạng tạm trú
                <select
                  className="select"
                  value={form.trangThaiTamTru}
                  onChange={(e) => capNhatTruong('trangThaiTamTru', e.target.value)}
                >
                  <option value="DA_DANG_KY">Đã đăng ký tạm trú</option>
                  <option value="CHUA_DANG_KY">Chưa đăng ký tạm trú</option>
                  <option value="HET_HAN">Hết hạn tạm trú</option>
                </select>
              </label>

              <label className="field-label">
                Nghề nghiệp / Nơi công tác
                <input
                  className="field"
                  type="text"
                  placeholder="Sinh viên PTIT / Nhân viên văn phòng"
                  value={form.ngheNghiep}
                  onChange={(e) => capNhatTruong('ngheNghiep', e.target.value)}
                />
              </label>

              <label className="field-label">
                Ghi chú
                <input
                  className="field"
                  type="text"
                  placeholder="Thông tin bổ sung (nếu có)"
                  value={form.ghiChu}
                  onChange={(e) => capNhatTruong('ghiChu', e.target.value)}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="button button--primary" disabled={dangLuu}>
                <Save size={14} /> {dangSuaId ? 'Cập nhật hồ sơ' : 'Lưu người thuê'}
              </button>
              <button type="button" className="button" onClick={() => setMoForm(false)}>
                Hủy
              </button>
              <SavingLabel active={dangLuu} />
            </div>
          </form>
        </section>
      )}

      {/* Thanh tìm kiếm & lọc */}
      <div className="nt-toolbar">
        <div className="nt-search-box">
          <Search size={15} className="nt-search-icon" />
          <input
            type="text"
            className="field nt-search-input"
            placeholder="Tìm theo họ tên, số điện thoại, CCCD, quê quán..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
        </div>

        <select
          className="select nt-filter-select"
          value={locTamTru}
          onChange={(e) => setLocTamTru(e.target.value)}
        >
          <option value="TAT_CA">Tất cả trạng thái tạm trú</option>
          <option value="DA_DANG_KY">Đã đăng ký tạm trú</option>
          <option value="CHUA_DANG_KY">Chưa đăng ký tạm trú</option>
          <option value="HET_HAN">Hết hạn tạm trú</option>
        </select>

        <span className="nt-stats-pill">
          <Users size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} />
          {danhSachLoc.length} / {danhSach.length} khách thuê
        </span>
      </div>

      {/* Bảng danh sách người thuê */}
      <section className="panel">
        <div className="panel__heading">
          <div>
            <h2>Danh sách người thuê trọ</h2>
            <p>Hiển thị thông tin liên hệ, giấy tờ tùy thân và trạng thái cư trú hiện tại.</p>
          </div>
        </div>

        <div className="panel__body--flush">
          {dangTai ? (
            <LoadingRows columns={6} rows={5} />
          ) : danhSachLoc.length === 0 ? (
            <EmptyState
              title="Chưa có dữ liệu người thuê"
              detail={
                tuKhoa || locTamTru !== 'TAT_CA'
                  ? 'Không tìm thấy khách thuê nào khớp với bộ lọc hiện tại.'
                  : 'Nhấn "Thêm người thuê" để tạo hồ sơ khách thuê đầu tiên.'
              }
              action={
                !tuKhoa &&
                locTamTru === 'TAT_CA' && (
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => batDauNhap()}
                  >
                    <Plus size={14} /> Thêm người thuê
                  </button>
                )
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Khách thuê</th>
                    <th>Số CCCD</th>
                    <th>Quê quán / Nghề nghiệp</th>
                    <th>Ngày sinh</th>
                    <th>Tạm trú</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachLoc.map((item) => {
                    const chuCaiDau =
                      Array.from(String(item.hoTen || '?').trim())[0]?.toLocaleUpperCase('vi-VN') ||
                      '?';
                    const trangThai = item.trangThaiTamTru || 'CHUA_DANG_KY';
                    const badgeCode =
                      trangThai === 'DA_DANG_KY'
                        ? 'HOAT_DONG'
                        : trangThai === 'HET_HAN'
                          ? 'QUA_HAN'
                          : 'CHO_XU_LY';

                    return (
                      <tr key={idOf(item)}>
                        <td>
                          <div className="nt-person-cell">
                            <span className="nt-avatar">{chuCaiDau}</span>
                            <div>
                              <div className="nt-person-name">{item.hoTen}</div>
                              <div className="nt-person-sub">
                                {item.soDienThoai}
                                {item.email ? ` · ${item.email}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {item.cccd ? (
                            <span className="nt-cccd-code">{item.cccd}</span>
                          ) : (
                            <span className="cell-subtitle">Chưa cập nhật</span>
                          )}
                        </td>
                        <td>
                          <div>{item.queQuan || '—'}</div>
                          {item.ngheNghiep && (
                            <div className="cell-subtitle">{item.ngheNghiep}</div>
                          )}
                        </td>
                        <td>{item.ngaySinh ? formatDate(item.ngaySinh) : '—'}</td>
                        <td>
                          <Status
                            value={badgeCode}
                            label={TRANG_THAI_TAM_TRU[trangThai] || trangThai}
                          />
                        </td>
                        <td>
                          <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="icon-action"
                              title="Chỉnh sửa hồ sơ"
                              onClick={() => batDauNhap(item)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-action icon-action--danger"
                              title="Xóa hồ sơ"
                              onClick={() => xuLyXoa(item)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}