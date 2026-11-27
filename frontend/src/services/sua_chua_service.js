import api from './api';

export const layDanhSachSuaChuaApi = (params) => api.get('/yeu-cau-sua-chua', { params });

export const layChiTietSuaChuaApi = (maYeuCau) => api.get(`/yeu-cau-sua-chua/${maYeuCau}`);

export const taoYeuCauSuaChuaApi = (duLieu) => api.post('/yeu-cau-sua-chua', duLieu);

export const capNhatTrangThaiSuaChuaApi = (maYeuCau, duLieu) => api.patch(`/yeu-cau-sua-chua/${maYeuCau}/trang-thai`, duLieu);