import { callApi } from './apiClient';

const dayTroService = {
  layDanhSach: ({ tuKhoa = '', page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (tuKhoa) params.append('tu-khoa', tuKhoa);
    params.append('page', page);
    params.append('limit', limit);
    return callApi(`/day-tro?${params.toString()}`);
  },

  layChiTiet: (maDayTro) => callApi(`/day-tro/${maDayTro}`),

  taoMoi: (payload) =>
    callApi('/day-tro', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  capNhat: (maDayTro, payload) =>
    callApi(`/day-tro/${maDayTro}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  xoa: (maDayTro) =>
    callApi(`/day-tro/${maDayTro}`, {
      method: 'DELETE',
    }),
};

export default dayTroService;