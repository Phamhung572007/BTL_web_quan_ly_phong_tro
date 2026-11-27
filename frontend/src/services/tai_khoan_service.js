import api from './api';

export const dangKyApi = (duLieu) => api.post('/dang-ky', duLieu);

export const dangNhapApi = (duLieu) => api.post('/dang-nhap', duLieu);

export const dangXuatApi = () => api.post('/dang-xuat');

export const layThongTinTaiKhoanApi = () => api.get('/tai-khoan');

export const capNhatTaiKhoanApi = (duLieu) => api.put('/tai-khoan', duLieu);

export const doiMatKhauApi = (duLieu) => api.put('/doi-mat-khau', duLieu);
