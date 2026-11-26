import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ImagePlus,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  layDanhSachSuaChuaApi,
  taoYeuCauSuaChuaApi,
  capNhatTrangThaiSuaChuaApi,
} from '../../services/sua_chua_service.js';
import { uploadNhieuAnhApi, layUrlAnh } from '../../services/upload_service.js';
import {
  EmptyState,
  LoadingRows,
  Notice,
  PageHeader,
  SavingLabel,
  Status,
} from '../../components/WorkspaceUI.jsx';
import { errorMessage, formatDate, formatMoney, idOf } from '../../utils/format.js';
import './SuaChua.css';

const TRANG_THAI_LABELS = {
  CHO_XU_LY: 'Chờ xử lý',
  DANG_XU_LY: 'Đang xử lý',
  HOAN_THANH: 'Hoàn thành',
  TU_CHOI: 'Từ chối',
};

const MUC_DO_LABELS = {
  THAP: 'Mức độ: Thấp',
  TRUNG_BINH: 'Mức độ: Trung bình',
  CAO: 'Mức độ: Cao',
  KHAN_CAP: 'Khẩn cấp',
};

const FORM_TAO_MAC_DINH = {
  tieuDe: '',
  moTa: '',
  mucDoUuTien: 'TRUNG_BINH',
  maPhong: '',
  hinhAnh: [],
};

export default function SuaChua() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const laChuTro = user?.vaiTro === 'CHU_TRO' || user?.vaiTro === 'ADMIN' || user?.vaiTro === 'QUAN_TRI';

  // Dữ liệu danh sách yêu cầu
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(true);

  // Bộ lọc tìm kiếm
  const [tuKhoa, setTuKhoa] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('TAT_CA');

  // Panel tạo yêu cầu mới (dành cho Khách thuê)
  const [moFormTao, setMoFormTao] = useState(false);
  const [formTao, setFormTao] = useState({ ...FORM_TAO_MAC_DINH });
  const [dangUploadAnh, setDangUploadAnh] = useState(false);
  const [dangGuiTao, setDangGuiTao] = useState(false);

  // Panel cập nhật xử lý (dành cho Chủ trọ)
  const [dangXuLyItem, setDangXuLyItem] = useState(null);
  const [formXuLy, setFormXuLy] = useState({
    trangThai: 'DANG_XU_LY',
    phanHoiChuTro: '',
    chiPhiPhatSinh: 0,
  });
  const [dangLuuXuLy, setDangLuuXuLy] = useState(false);

  // Thông báo
  const [loi, setLoi] = useState('');
  const [thanhCong, setThanhCong] = useState('');

  // Tải danh sách yêu cầu sửa chữa
  async function taiDanhSach() {
    setDangTai(true);
    setLoi('');
    try {
      const res = await layDanhSachSuaChuaApi({ limit: 200 });
      const duLieu = res.data?.items || res.data || [];
      setDanhSach(Array.isArray(duLieu) ? duLieu : []);
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể tải danh sách yêu cầu sửa chữa.'));
    } finally {
      setDangTai(false);
    }
  }

  useEffect(() => {
    taiDanhSach();
  }, []);

  // Thống kê nhanh theo trạng thái
  const thongKe = useMemo(() => {
    return danhSach.reduce(
      (acc, item) => {
        acc.tong += 1;
        if (item.trangThai === 'CHO_XU_LY') acc.choXuLy += 1;
        else if (item.trangThai === 'DANG_XU_LY') acc.dangXuLy += 1;
        else if (item.trangThai === 'HOAN_THANH') acc.hoanThanh += 1;
        return acc;
      },
      { tong: 0, choXuLy: 0, dangXuLy: 0, hoanThanh: 0 }
    );
  }, [danhSach]);

  // Lọc danh sách theo từ khóa và trạng thái
  const danhSachLoc = useMemo(() => {
    const kw = tuKhoa.trim().toLowerCase();
    return danhSach.filter((item) => {
      const khopTrangThai = locTrangThai === 'TAT_CA' || item.trangThai === locTrangThai;
      if (!khopTrangThai) return false;
      if (!kw) return true;

      const chuoiTim = [
        item.tieuDe,
        item.moTa,
        item.phong?.tenPhong,
        item.phong?.soPhong,
        item.nguoiGui?.hoTen,
        item.phanHoiChuTro,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return chuoiTim.includes(kw);
    });
  }, [danhSach, tuKhoa, locTrangThai]);

  // Khách thuê upload ảnh sự cố
  async function xuLyChonAnh(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDangUploadAnh(true);
    setLoi('');
    try {
      const res = await uploadNhieuAnhApi(files);
      const urls = res.data?.urls || res.data || [];
      const danhSachUrl = Array.isArray(urls) ? urls : [urls];
      setFormTao((prev) => ({
        ...prev,
        hinhAnh: [...prev.hinhAnh, ...danhSachUrl],
      }));
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể tải ảnh minh họa lên.'));
    } finally {
      setDangUploadAnh(false);
      e.target.value = '';
    }
  }

  function xoaAnhTam(index) {
    setFormTao((prev) => ({
      ...prev,
      hinhAnh: prev.hinhAnh.filter((_, i) => i !== index),
    }));
  }

  // Khách thuê gửi yêu cầu sửa chữa mới
  async function xuLyGuiYeuCau(e) {
    e.preventDefault();
    if (!formTao.tieuDe.trim() || !formTao.moTa.trim()) {
      setLoi('Vui lòng nhập tiêu đề và mô tả chi tiết sự cố.');
      return;
    }

    setDangGuiTao(true);
    setLoi('');
    setThanhCong('');
    try {
      const payload = {
        tieuDe: formTao.tieuDe.trim(),
        moTa: formTao.moTa.trim(),
        mucDoUuTien: formTao.mucDoUuTien,
        hinhAnh: formTao.hinhAnh,
        ...(formTao.maPhong.trim() ? { maPhong: formTao.maPhong.trim() } : {}),
      };
      await taoYeuCauSuaChuaApi(payload);
      setThanhCong('Đã gửi yêu cầu sửa chữa tới chủ trọ.');
      setFormTao({ ...FORM_TAO_MAC_DINH });
      setMoFormTao(false);
      await taiDanhSach();
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể gửi yêu cầu sửa chữa.'));
    } finally {
      setDangGuiTao(false);
    }
  }

  // Chủ trọ mở khung cập nhật trạng thái xử lý
  function moCapNhatXuLy(item) {
    setDangXuLyItem(item);
    setFormXuLy({
      trangThai: item.trangThai === 'CHO_XU_LY' ? 'DANG_XU_LY' : item.trangThai || 'DANG_XU_LY',
      phanHoiChuTro: item.phanHoiChuTro || '',
      chiPhiPhatSinh: item.chiPhiPhatSinh || 0,
    });
    setLoi('');
    setThanhCong('');
  }

  // Chủ trọ lưu tiến độ xử lý sự cố
  async function xuLyLuuCapNhat(e) {
    e.preventDefault();
    if (!dangXuLyItem) return;

    setDangLuuXuLy(true);
    setLoi('');
    setThanhCong('');
    try {
      await capNhatTrangThaiSuaChuaApi(idOf(dangXuLyItem), {
        trangThai: formXuLy.trangThai,
        phanHoiChuTro: formXuLy.phanHoiChuTro.trim(),
        chiPhiPhatSinh: Number(formXuLy.chiPhiPhatSinh) || 0,
      });
      setThanhCong('Đã cập nhật trạng thái xử lý yêu cầu sửa chữa.');
      setDangXuLyItem(null);
      await taiDanhSach();
    } catch (err) {
      setLoi(errorMessage(err, 'Không thể cập nhật yêu cầu sửa chữa.'));
    } finally {
      setDangLuuXuLy(false);
    }
  }

  return (
    <section className="page">
      <PageHeader
        title={laChuTro ? 'Quản lý yêu cầu sửa chữa' : 'Yêu cầu sửa chữa & bảo trì'}
        description={
          laChuTro
            ? 'Tiếp nhận sự cố từ khách thuê, cập nhật tiến độ khắc phục và chi phí phát sinh.'
            : 'Báo hỏng thiết bị điện, nước, cơ sở vật chất trong phòng và theo dõi tiến độ xử lý.'
        }
        actions={
          <>
            <button type="button" className="button" onClick={taiDanhSach} disabled={dangTai}>
              <RotateCcw size={14} /> Tải lại
            </button>
            {!laChuTro && (
              <button
                type="button"
                className="button button--warm"
                onClick={() => {
                  setMoFormTao(true);
                  setLoi('');
                  setThanhCong('');
                }}
              >
                <Plus size={14} /> Gửi yêu cầu sửa chữa
              </button>
            )}
          </>
        }
      />

      {loi && <Notice onClose={() => setLoi('')}>{loi}</Notice>}
      {thanhCong && (
        <Notice tone="success" onClose={() => setThanhCong('')}>
          {thanhCong}
        </Notice>
      )}

      {/* Thống kê tổng quan 4 thẻ */}
      <div className="sc-summary-grid">
        <div className="sc-stat-card">
          <span className="sc-stat-label">Tổng yêu cầu</span>
          <span className="sc-stat-value">{thongKe.tong}</span>
        </div>
        <div className="sc-stat-card">
          <span className="sc-stat-label">Chờ tiếp nhận</span>
          <span className="sc-stat-value sc-stat-value--amber">{thongKe.choXuLy}</span>
        </div>
        <div className="sc-stat-card">
          <span className="sc-stat-label">Đang sửa chữa</span>
          <span className="sc-stat-value sc-stat-value--blue">{thongKe.dangXuLy}</span>
        </div>
        <div className="sc-stat-card">
          <span className="sc-stat-label">Đã hoàn thành</span>
          <span className="sc-stat-value sc-stat-value--green">{thongKe.hoanThanh}</span>
        </div>
      </div>

      {/* Form Khách thuê gửi yêu cầu mới */}
      {!laChuTro && moFormTao && (
        <section className="panel editor-panel">
          <div className="panel__heading">
            <div>
              <h2>Tạo yêu cầu sửa chữa mới</h2>
              <p>Mô tả rõ tình trạng hư hỏng và đính kèm hình ảnh để chủ trọ hỗ trợ nhanh nhất.</p>
            </div>
            <button
              type="button"
              className="icon-action"
              aria-label="Đóng"
              onClick={() => setMoFormTao(false)}
            >
              <X size={16} />
            </button>
          </div>

          <form className="panel__body editor-form" onSubmit={xuLyGuiYeuCau}>
            <div className="form-grid form-grid--two">
              <label className="field-label">
                Tiêu đề sự cố *
                <input
                  className="field"
                  type="text"
                  required
                  placeholder="Ví dụ: Vòi nước bồn rửa bị rò rỉ / Hỏng điều hòa"
                  value={formTao.tieuDe}
                  onChange={(e) => setFormTao((p) => ({ ...p, tieuDe: e.target.value }))}
                />
              </label>

              <label className="field-label">
                Mức độ ưu tiên
                <select
                  className="select"
                  value={formTao.mucDoUuTien}
                  onChange={(e) => setFormTao((p) => ({ ...p, mucDoUuTien: e.target.value }))}
                >
                  <option value="THAP">Thấp (không gấp)</option>
                  <option value="TRUNG_BINH">Trung bình</option>
                  <option value="CAO">Cao (ảnh hưởng sinh hoạt)</option>
                  <option value="KHAN_CAP">Khẩn cấp (mất điện/nước, chập cháy)</option>
                </select>
              </label>

              <label className="field-label form-span-two">
                Mô tả chi tiết sự cố *
                <textarea
                  className="textarea"
                  rows={3}
                  required
                  placeholder="Ghi rõ vị trí thiết bị hỏng, thời điểm phát hiện và khung giờ bạn có mặt tại phòng..."
                  value={formTao.moTa}
                  onChange={(e) => setFormTao((p) => ({ ...p, moTa: e.target.value }))}
                />
              </label>

              <div className="field-label form-span-two">
                <span>Hình ảnh minh họa (tùy chọn)</span>
                <div style={{ marginTop: 6 }}>
                  <button
                    type="button"
                    className="button"
                    disabled={dangUploadAnh}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={14} /> {dangUploadAnh ? 'Đang tải ảnh...' : 'Chọn ảnh sự cố'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={xuLyChonAnh}
                  />
                </div>

                {formTao.hinhAnh.length > 0 && (
                  <div className="sc-upload-preview">
                    {formTao.hinhAnh.map((url, idx) => (
                      <div className="sc-upload-item" key={idx}>
                        <img src={layUrlAnh(url)} alt={`Ảnh ${idx + 1}`} />
                        <button
                          type="button"
                          className="sc-upload-remove"
                          onClick={() => xoaAnhTam(idx)}
                          title="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button button--primary"
                disabled={dangGuiTao || dangUploadAnh}
              >
                <Save size={14} /> Gửi yêu cầu
              </button>
              <button type="button" className="button" onClick={() => setMoFormTao(false)}>
                Hủy
              </button>
              <SavingLabel active={dangGuiTao} children="Đang gửi..." />
            </div>
          </form>
        </section>
      )}

      {/* Panel Chủ trọ cập nhật trạng thái xử lý */}
      {laChuTro && dangXuLyItem && (
        <section className="panel editor-panel">
          <div className="panel__heading">
            <div>
              <h2>Xử lý sự cố: {dangXuLyItem.tieuDe}</h2>
              <p>
                Phòng: {dangXuLyItem.phong?.tenPhong || dangXuLyItem.phong?.soPhong || 'Chưa gắn phòng'}{' '}
                · Người gửi: {dangXuLyItem.nguoiGui?.hoTen || 'Khách thuê'}
              </p>
            </div>
            <button
              type="button"
              className="icon-action"
              aria-label="Đóng"
              onClick={() => setDangXuLyItem(null)}
            >
              <X size={16} />
            </button>
          </div>

          <form className="panel__body editor-form" onSubmit={xuLyLuuCapNhat}>
            <div className="form-grid form-grid--two">
              <label className="field-label">
                Trạng thái xử lý
                <select
                  className="select"
                  value={formXuLy.trangThai}
                  onChange={(e) => setFormXuLy((p) => ({ ...p, trangThai: e.target.value }))}
                >
                  <option value="CHO_XU_LY">Chờ xử lý</option>
                  <option value="DANG_XU_LY">Đang xử lý</option>
                  <option value="HOAN_THANH">Hoàn thành</option>
                  <option value="TU_CHOI">Từ chối</option>
                </select>
              </label>

              <label className="field-label">
                Chi phí sửa chữa phát sinh (VNĐ)
                <input
                  className="field"
                  type="number"
                  min={0}
                  step={1000}
                  value={formXuLy.chiPhiPhatSinh}
                  onChange={(e) => setFormXuLy((p) => ({ ...p, chiPhiPhatSinh: e.target.value }))}
                />
              </label>

              <label className="field-label form-span-two">
                Phản hồi / Ghi chú cho khách thuê
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Ví dụ: Thợ kỹ thuật sẽ qua kiểm tra lúc 15h chiều nay..."
                  value={formXuLy.phanHoiChuTro}
                  onChange={(e) => setFormXuLy((p) => ({ ...p, phanHoiChuTro: e.target.value }))}
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="button button--primary" disabled={dangLuuXuLy}>
                <CheckCircle2 size={14} /> Lưu cập nhật
              </button>
              <button type="button" className="button" onClick={() => setDangXuLyItem(null)}>
                Đóng
              </button>
              <SavingLabel active={dangLuuXuLy} />
            </div>
          </form>
        </section>
      )}

      {/* Thanh tìm kiếm & lọc */}
      <div className="sc-toolbar">
        <div className="sc-search-box">
          <Search size={15} className="sc-search-icon" />
          <input
            type="text"
            className="field sc-search-input"
            placeholder="Tìm theo tiêu đề sự cố, tên phòng, mô tả..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
        </div>

        <select
          className="select sc-filter-select"
          value={locTrangThai}
          onChange={(e) => setLocTrangThai(e.target.value)}
        >
          <option value="TAT_CA">Tất cả trạng thái</option>
          <option value="CHO_XU_LY">Chờ xử lý</option>
          <option value="DANG_XU_LY">Đang xử lý</option>
          <option value="HOAN_THANH">Hoàn thành</option>
          <option value="TU_CHOI">Từ chối</option>
        </select>
      </div>

      {/* Danh sách yêu cầu sửa chữa */}
      <section className="panel">
        <div className="panel__heading">
          <div>
            <h2>Danh sách yêu cầu sửa chữa</h2>
            <p>{danhSachLoc.length} yêu cầu · Sắp xếp mới nhất lên trên.</p>
          </div>
        </div>

        <div className="panel__body--flush">
          {dangTai ? (
            <LoadingRows columns={4} rows={5} />
          ) : danhSachLoc.length === 0 ? (
            <EmptyState
              title="Chưa có yêu cầu sửa chữa"
              detail={
                tuKhoa || locTrangThai !== 'TAT_CA'
                  ? 'Không tìm thấy yêu cầu nào khớp với bộ lọc hiện tại.'
                  : laChuTro
                    ? 'Hiện chưa có khách thuê nào gửi báo hỏng.'
                    : 'Phòng của bạn đang hoạt động ổn định. Nhấn "Gửi yêu cầu sửa chữa" nếu cần hỗ trợ.'
              }
              action={
                !laChuTro &&
                !tuKhoa &&
                locTrangThai === 'TAT_CA' && (
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setMoFormTao(true)}
                  >
                    <Plus size={14} /> Gửi yêu cầu sửa chữa
                  </button>
                )
              }
            />
          ) : (
            <div className="sc-list">
              {danhSachLoc.map((item) => {
                const danhSachAnh = Array.isArray(item.hinhAnh) ? item.hinhAnh : [];
                const tenPhong = item.phong?.tenPhong || item.phong?.soPhong;

                return (
                  <article className="sc-row" key={idOf(item)}>
                    <div className="sc-row-left">
                      <span className="sc-row-icon">
                        <Wrench size={17} />
                      </span>

                      <div className="sc-row-main">
                        <div className="sc-row-header">
                          <h3 className="sc-row-title">{item.tieuDe}</h3>
                          {tenPhong && <span className="sc-room-tag">{tenPhong}</span>}
                          {item.mucDoUuTien && (
                            <span className={`sc-priority-tag sc-priority-tag--${item.mucDoUuTien}`}>
                              {MUC_DO_LABELS[item.mucDoUuTien] || item.mucDoUuTien}
                            </span>
                          )}
                        </div>

                        <p className="sc-row-desc">{item.moTa}</p>

                        {danhSachAnh.length > 0 && (
                          <div className="sc-thumbs">
                            {danhSachAnh.map((anh, idx) => (
                              <a
                                key={idx}
                                href={layUrlAnh(anh)}
                                target="_blank"
                                rel="noreferrer"
                                className="sc-thumb-link"
                                title="Xem ảnh đầy đủ"
                              >
                                <img src={layUrlAnh(anh)} alt={`Hiện trường ${idx + 1}`} />
                              </a>
                            ))}
                          </div>
                        )}

                        {item.phanHoiChuTro && (
                          <div className="sc-owner-note">
                            <strong>Phản hồi từ chủ trọ:</strong> {item.phanHoiChuTro}
                          </div>
                        )}

                        <div className="cell-subtitle">
                          Gửi lúc{' '}
                          {formatDate(item.createdAt, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {item.nguoiGui?.hoTen ? ` · Bởi ${item.nguoiGui.hoTen}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="sc-row-right">
                      <Status
                        value={item.trangThai}
                        label={TRANG_THAI_LABELS[item.trangThai] || item.trangThai}
                      />

                      {Number(item.chiPhiPhatSinh) > 0 && (
                        <span className="sc-cost">
                          Chi phí: {formatMoney(item.chiPhiPhatSinh)}
                        </span>
                      )}

                      {laChuTro && (
                        <button
                          type="button"
                          className="button"
                          onClick={() => moCapNhatXuLy(item)}
                        >
                          <Settings2 size={14} /> Cập nhật xử lý
                        </button>
                      )}
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