import { callApi } from './apiClient';

const tinDangService = {
  // Dùng chung cho cả trang Tìm phòng công khai (TV3) và Chủ trọ (?cua-toi=true)
  timKiemTinDang: (filters = {}) => {
    const params = new URLSearchParams();
    const allowedKeys = [
      'tu-khoa',
      'tinh',
      'quan',
      'gia-tu',
      'gia-den',
      'dien-tich-tu',
      'dien-tich-den',
      'lat',
      'lng',
      'ban-kinh-km',
      'page',
      'limit',
      'sap-xep',
      'cua-toi',
      'trangThai',
    ];

    allowedKeys.forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const query = params.toString();
    return callApi(`/tin-dang${query ? `?${query}` : ''}`);
  },

  layChiTiet: (maTinDang) => callApi(`/tin-dang/${maTinDang}`),

  taoMoi: (payload) =>
    callApi('/tin-dang', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  capNhat: (maTinDang, payload) =>
    callApi(`/tin-dang/${maTinDang}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  doiTrangThai: (maTinDang, trangThai) =>
    callApi(`/tin-dang/${maTinDang}/trang-thai`, {
      method: 'PATCH',
      body: JSON.stringify({ trangThai }),
    }),

  xoa: (maTinDang) =>
    callApi(`/tin-dang/${maTinDang}`, {
      method: 'DELETE',
    }),

  // Gọi API Upload ảnh của Thành viên 3
  uploadAnh: (fileList) => {
    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append('images', file));
    return callApi('/upload/anh', {
      method: 'POST',
      body: formData,
    });
  },
};

export default tinDangService;