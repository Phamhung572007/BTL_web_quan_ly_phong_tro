import { callApi } from './apiClient';

const phongTroService = {
  layDanhSach: ({ dayTroId = '', trangThai = '', tuKhoa = '', page = 1, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    if (dayTroId) params.append('dayTroId', dayTroId);
    if (trangThai) params.append('trangThai', trangThai);
    if (tuKhoa) params.append('tu-khoa', tuKhoa);
    params.append('page', page);
    params.append('limit', limit);
    return callApi(`/phong-tro?${params.toString()}`);
  },

  layChiTiet: (maPhong) => callApi(`/phong-tro/${maPhong}`),

  layPhongTrong: ({ dayTroId = '', page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (dayTroId) params.append('dayTroId', dayTroId);
    params.append('page', page);
    params.append('limit', limit);
    return callApi(`/phong-tro-trong?${params.toString()}`);
  },

  taoMoi: (payload) =>
    callApi('/phong-tro', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  capNhat: (maPhong, payload) =>
    callApi(`/phong-tro/${maPhong}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  xoa: (maPhong) =>
    callApi(`/phong-tro/${maPhong}`, {
      method: 'DELETE',
    }),
};

export default phongTroService;