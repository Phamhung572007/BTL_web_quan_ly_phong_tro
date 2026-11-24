const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function callApi(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getHeaders(options.body instanceof FormData),
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Có lỗi xảy ra khi gọi máy chủ');
  }
  return json;
}

// ==================== 1. API DÃY TRỌ ====================
export const dayTroService = {
  layDanhSach: (tuKhoa = '') =>
    callApi(`/day-tro?tu-khoa=${encodeURIComponent(tuKhoa)}`),
  layChiTiet: (maDayTro) =>
    callApi(`/day-tro/${maDayTro}`),
  taoMoi: (payload) =>
    callApi('/day-tro', { method: 'POST', body: JSON.stringify(payload) }),
  capNhat: (maDayTro, payload) =>
    callApi(`/day-tro/${maDayTro}`, { method: 'PUT', body: JSON.stringify(payload) }),
  xoa: (maDayTro) =>
    callApi(`/day-tro/${maDayTro}`, { method: 'DELETE' }),
};

// ==================== 2. API PHÒNG TRỌ ====================
export const phongTroService = {
  layDanhSach: ({ dayTroId = '', trangThai = '', tuKhoa = '' } = {}) => {
    const params = new URLSearchParams();
    if (dayTroId) params.append('dayTroId', dayTroId);
    if (trangThai) params.append('trangThai', trangThai);
    if (tuKhoa) params.append('tu-khoa', tuKhoa);
    return callApi(`/phong-tro?${params.toString()}`);
  },
  layChiTiet: (maPhong) =>
    callApi(`/phong-tro/${maPhong}`),
  layPhongTrong: (dayTroId = '') =>
    callApi(`/phong-tro-trong${dayTroId ? `?dayTroId=${dayTroId}` : ''}`),
  taoMoi: (payload) =>
    callApi('/phong-tro', { method: 'POST', body: JSON.stringify(payload) }),
  capNhat: (maPhong, payload) =>
    callApi(`/phong-tro/${maPhong}`, { method: 'PUT', body: JSON.stringify(payload) }),
  xoa: (maPhong) =>
    callApi(`/phong-tro/${maPhong}`, { method: 'DELETE' }),
};

// ==================== 3. API HỢP ĐỒNG & NGƯỜI THUÊ ====================
export const hopDongService = {
  layDanhSach: (trangThai = '') =>
    callApi(`/hop-dong${trangThai ? `?trangThai=${trangThai}` : ''}`),
  layChiTiet: (maHopDong) =>
    callApi(`/hop-dong/${maHopDong}`),
  taoMoi: (payload) =>
    callApi('/hop-dong', { method: 'POST', body: JSON.stringify(payload) }),
  capNhat: (maHopDong, payload) =>
    callApi(`/hop-dong/${maHopDong}`, { method: 'PUT', body: JSON.stringify(payload) }),
  ketThuc: (maHopDong, ghiChuThanhLy = '') =>
    callApi(`/hop-dong/${maHopDong}/ket-thuc`, {
      method: 'PATCH',
      body: JSON.stringify({ ghiChuThanhLy }),
    }),
  layDanhSachNguoiThue: () =>
    callApi('/nguoi-thue'),
};

// ==================== 4. API TIN ĐĂNG PHÒNG & UPLOAD ====================
export const tinDangService = {
  layDanhSach: () =>
    callApi('/tin-dang'),
  layChiTiet: (maTinDang) =>
    callApi(`/tin-dang/${maTinDang}`),
  taoMoi: (payload) =>
    callApi('/tin-dang', { method: 'POST', body: JSON.stringify(payload) }),
  capNhat: (maTinDang, payload) =>
    callApi(`/tin-dang/${maTinDang}`, { method: 'PUT', body: JSON.stringify(payload) }),
  doiTrangThai: (maTinDang, trangThai) =>
    callApi(`/tin-dang/${maTinDang}/trang-thai`, {
      method: 'PATCH',
      body: JSON.stringify({ trangThai }),
    }),
  xoa: (maTinDang) =>
    callApi(`/tin-dang/${maTinDang}`, { method: 'DELETE' }),
  uploadAnh: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    return callApi('/upload/anh', { method: 'POST', body: formData });
  },
};