import { callApi } from './apiClient';

const hopDongService = {
  layDanhSach: ({ trangThai = '', tuKhoa = '', page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (trangThai) params.append('trangThai', trangThai);
    if (tuKhoa) params.append('tu-khoa', tuKhoa);
    params.append('page', page);
    params.append('limit', limit);
    return callApi(`/hop-dong?${params.toString()}`);
  },

  layChiTiet: (maHopDong) => callApi(`/hop-dong/${maHopDong}`),

  taoMoi: (payload) =>
    callApi('/hop-dong', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  capNhat: (maHopDong, payload) =>
    callApi(`/hop-dong/${maHopDong}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  ketThuc: (maHopDong, ghiChuThanhLy = '') =>
    callApi(`/hop-dong/${maHopDong}/ket-thuc`, {
      method: 'PATCH',
      body: JSON.stringify({ ghiChuThanhLy }),
    }),

  // Gọi API của Thành viên 3 để lấy danh sách khách thuê chọn vào hợp đồng
  layDanhSachNguoiThue: () => callApi('/nguoi-thue?limit=100'),
};

export default hopDongService;