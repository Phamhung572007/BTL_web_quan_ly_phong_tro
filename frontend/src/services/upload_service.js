import api from './api';

//truyền vào mảng File hoặc FileList từ <input type="file" />
export const uploadNhieuAnhApi = (danhSachFile) => {
  const formData = new FormData();
  Array.from(danhSachFile).forEach((file) => {
    formData.append('images', file);
  });

  return api.post('/upload/anh', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

//hàm tiện ích chuyển đường dẫn tương đối (/uploads/...) thành URL đầy đủ để gắn vào thẻ <img>
export const layUrlAnh = (duongDan) => {
  if (!duongDan) return '';
  if (duongDan.startsWith('http')) return duongDan;
  const serverUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${serverUrl}${duongDan}`;
};