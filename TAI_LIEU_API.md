# TÀI LIỆU THIẾT KẾ API
# DỰ ÁN QUẢN LÝ NHÀ TRỌ

## 1. Thông tin dự án

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: MongoDB
- ODM: Mongoose
- Kiểu API: RESTful API
- Định dạng dữ liệu: JSON

**Địa chỉ Backend:**

`http://localhost:5000/api`

## 2. Quy ước API

| Phương thức | Ý nghĩa |
|---|---|
| GET | Lấy dữ liệu |
| POST | Thêm dữ liệu |
| PUT | Cập nhật toàn bộ dữ liệu |
| PATCH | Cập nhật một phần dữ liệu |
| DELETE | Xóa dữ liệu |

### Mã trạng thái HTTP

| Mã | Ý nghĩa |
|---|---|
| 200 | Thành công |
| 201 | Tạo dữ liệu thành công |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy dữ liệu |
| 409 | Dữ liệu bị trùng hoặc xung đột |
| 500 | Lỗi máy chủ |

## 3. API QUẢN LÝ TÀI KHOẢN

**Phụ trách: Thành viên 3**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| POST | `/dang-ky` | Đăng ký tài khoản |
| POST | `/dang-nhap` | Đăng nhập |
| GET | `/tai-khoan` | Lấy thông tin tài khoản hiện tại |
| PUT | `/tai-khoan` | Cập nhật thông tin cá nhân |
| PUT | `/doi-mat-khau` | Đổi mật khẩu |
| POST | `/dang-xuat` | Đăng xuất |

## 4. API QUẢN LÝ DÃY TRỌ

**Phụ trách: Thành viên 2**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/day-tro` | Lấy danh sách dãy trọ |
| GET | `/day-tro/:maDayTro` | Lấy chi tiết dãy trọ |
| POST | `/day-tro` | Thêm dãy trọ |
| PUT | `/day-tro/:maDayTro` | Cập nhật dãy trọ |
| DELETE | `/day-tro/:maDayTro` | Xóa dãy trọ |

## 5. API QUẢN LÝ PHÒNG TRỌ

**Phụ trách: Thành viên 2**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/phong-tro` | Lấy danh sách phòng |
| GET | `/phong-tro/:maPhong` | Xem chi tiết phòng |
| POST | `/phong-tro` | Thêm phòng |
| PUT | `/phong-tro/:maPhong` | Cập nhật phòng |
| DELETE | `/phong-tro/:maPhong` | Xóa phòng |
| GET | `/phong-tro-trong` | Lấy danh sách phòng trống |

## 6. API QUẢN LÝ NGƯỜI THUÊ

**Phụ trách: Thành viên 2**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/nguoi-thue` | Lấy danh sách người thuê |
| GET | `/nguoi-thue/:maNguoiThue` | Xem chi tiết người thuê |
| POST | `/nguoi-thue` | Thêm người thuê |
| PUT | `/nguoi-thue/:maNguoiThue` | Cập nhật người thuê |
| DELETE | `/nguoi-thue/:maNguoiThue` | Xóa người thuê |

## 7. API QUẢN LÝ HỢP ĐỒNG

**Phụ trách: Thành viên 2**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/hop-dong` | Lấy danh sách hợp đồng |
| GET | `/hop-dong/:maHopDong` | Xem chi tiết hợp đồng |
| POST | `/hop-dong` | Tạo hợp đồng |
| PUT | `/hop-dong/:maHopDong` | Cập nhật hợp đồng |
| PATCH | `/hop-dong/:maHopDong/ket-thuc` | Kết thúc hợp đồng |

## 8. API QUẢN LÝ DỊCH VỤ VÀ ĐƠN GIÁ

**Phụ trách: Thành viên 1**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/dich-vu` | Lấy danh sách dịch vụ và đơn giá |
| GET | `/dich-vu/:maDichVu` | Xem chi tiết dịch vụ |
| POST | `/dich-vu` | Thêm dịch vụ mới |
| PUT | `/dich-vu/:maDichVu` | Cập nhật đơn giá dịch vụ |
| DELETE | `/dich-vu/:maDichVu` | Xóa dịch vụ |

## 9. API QUẢN LÝ CHỈ SỐ ĐIỆN NƯỚC

**Phụ trách: Thành viên 1**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/chi-so-dien-nuoc` | Lấy danh sách chỉ số |
| GET | `/chi-so-dien-nuoc/:maChiSo` | Xem chi tiết chỉ số |
| POST | `/chi-so-dien-nuoc/nhap-hang-loat` | Nhập điện nước nhiều phòng |
| GET | `/chi-so-dien-nuoc/phong/:maPhong` | Xem lịch sử điện nước của phòng |
| PUT | `/chi-so-dien-nuoc/:maChiSo` | Cập nhật chỉ số điện nước |

## 10. API QUẢN LÝ HÓA ĐƠN

**Phụ trách: Thành viên 1**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/hoa-don` | Lấy danh sách hóa đơn |
| GET | `/hoa-don/:maHoaDon` | Xem chi tiết hóa đơn |
| POST | `/hoa-don/tao-moi` | Tạo hóa đơn |
| POST | `/hoa-don/tao-tu-dong` | Tạo hóa đơn tự động hàng loạt |
| PATCH | `/hoa-don/:maHoaDon/thanh-toan` | Đánh dấu đã thanh toán |
| GET | `/hoa-don/phong/:maPhong` | Lấy hóa đơn theo phòng |

## 11. API THỐNG KÊ DASHBOARD

**Phụ trách: Thành viên 3**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/thong-ke/tong-quan` | Thống kê tổng quan nhà trọ |
| GET | `/thong-ke/doanh-thu` | Thống kê doanh thu theo tháng |
| GET | `/thong-ke/phong-no-tien` | Danh sách phòng còn nợ tiền |

## 12. API QUẢN LÝ YÊU CẦU SỬA CHỮA

**Phụ trách: Thành viên 3**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/yeu-cau-sua-chua` | Lấy danh sách yêu cầu sửa chữa |
| GET | `/yeu-cau-sua-chua/:maYeuCau` | Xem chi tiết yêu cầu |
| POST | `/yeu-cau-sua-chua` | Tạo yêu cầu sửa chữa |
| PATCH | `/yeu-cau-sua-chua/:maYeuCau/trang-thai` | Cập nhật trạng thái sửa chữa |

## 13. API UPLOAD TỆP TIN

**Phụ trách: Thành viên 3**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| POST | `/upload/anh` | Tải lên hình ảnh (phòng trọ, CCCD, báo hỏng) |

## 14. Quy tắc nghiệp vụ

1. Không tạo hợp đồng mới cho phòng đang có hợp đồng hiệu lực.
2. Phòng tự động cập nhật trạng thái khi hợp đồng thay đổi.
3. Chỉ số điện nước mới không được nhỏ hơn chỉ số cũ.
4. Tiền điện nước phải được tính tại Backend.
5. Mỗi phòng chỉ có một hóa đơn trong một tháng.
6. Không cho phép người thuê xem hóa đơn của phòng khác.
7. Chỉ chủ trọ mới được quản lý phòng, hợp đồng và hóa đơn.
8. Khách chỉ được xem danh sách phòng trống và thông tin liên hệ.
9. Hóa đơn phải tính tiền phòng, điện, nước và phí dịch vụ.
10. Không cho phép tạo hóa đơn trùng kỳ cho cùng một phòng.

## 15. Quy ước lập trình

- Tên file: tiếng Việt không dấu.
- Tên biến và hàm: camelCase.
- Tên Model: PascalCase.
- Tên API: tiếng Việt không dấu.
- Dữ liệu trao đổi giữa Frontend và Backend: JSON.
- Tất cả API phải kiểm tra dữ liệu đầu vào.
- API cần bảo vệ phải kiểm tra đăng nhập và phân quyền.
- Các lỗi phải được xử lý thông qua Middleware.

## 16. Quy trình phối hợp nhóm

### Thành viên 1

- Thiết kế Database toàn dự án.
- Thiết kế API toàn dự án.
- Lập trình API quản lý dịch vụ và đơn giá.
- Lập trình API điện nước.
- Lập trình API hóa đơn.
- Kiểm thử và tích hợp Backend.

### Thành viên 2

- Lập trình API quản lý dãy trọ.
- Lập trình API quản lý phòng.
- Lập trình API người thuê.
- Lập trình API hợp đồng.
- Xây dựng giao diện tương ứng.

### Thành viên 3

- Lập trình API đăng nhập và phân quyền.
- Lập trình API upload tệp tin.
- Lập trình API thống kê.
- Lập trình API yêu cầu sửa chữa.
- Xây dựng giao diện tương ứng.

### Quy định chung

- Mọi thay đổi API phải được thống nhất trong nhóm.
- Mỗi thành viên tự kiểm thử API mình phụ trách.
- Các thành viên phải kiểm thử tích hợp trước khi hoàn thành.
- Không commit trực tiếp lên nhánh main.
- Mỗi chức năng cần được kiểm tra trước khi tạo Pull Request.