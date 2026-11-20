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

### Quy tắc đặt tên và thiết kế endpoint

- Các đường dẫn trong bảng là phần nối sau `http://localhost:5000/api`.
- Dùng tiếng Việt không dấu, chữ thường và dấu gạch nối, ví dụ `/lich-xem`, `/tin-dang`, `/danh-gia-phong`.
- Dùng tên tài nguyên cho đường dẫn gốc; dùng `:ma...` cho mã trong đường dẫn, ví dụ `/phong-tro/:maPhong`.
- Dùng `GET` để đọc, `POST` để tạo, `PUT` để thay thế toàn bộ, `PATCH` để cập nhật một phần/trạng thái và `DELETE` để xóa.
- Bộ lọc, tìm kiếm, sắp xếp và phân trang đặt ở query string (`?tu-khoa=...&page=1&limit=20`), không tạo endpoint riêng cho từng bộ lọc.
- Chỉ thêm hậu tố hành động cho chuyển trạng thái nghiệp vụ rõ ràng, như `/thanh-toan`, `/duyet`, `/huy`; không dùng động từ làm tên tài nguyên gốc.
- `/phong-tro-trong` trả về phòng còn trống; `/tin-dang` trả về tin công khai đã đăng. Dùng đúng một endpoint cho mỗi mục đích, không tạo route tìm kiếm trùng lặp.
- Mặc định endpoint quản trị cần đăng nhập và kiểm tra vai trò. Endpoint công khai chỉ trả dữ liệu tin đã đăng; dữ liệu riêng tư chỉ trả cho chủ thể hoặc người có quyền.
- Request và response dùng JSON, trừ upload ảnh dùng `multipart/form-data`. Response thống nhất các trường `success`, `message`, `data`; danh sách có thể thêm `meta` cho phân trang.

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

**Phụ trách: Thành viên 1 (Hùng)**

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

## 14. API LỊCH HẸN XEM PHÒNG

**Phụ trách: Thành viên 1 (Hùng)**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/lich-xem` | Lấy lịch hẹn theo tài khoản; hỗ trợ lọc `tu-ngay`, `den-ngay`, `trang-thai` |
| GET | `/lich-xem/:maLichXem` | Xem chi tiết lịch hẹn |
| POST | `/lich-xem` | Người thuê gửi yêu cầu xem một tin/phòng vào thời gian mong muốn |
| PATCH | `/lich-xem/:maLichXem/duyet` | Chủ trọ duyệt lịch hẹn |
| PATCH | `/lich-xem/:maLichXem/doi-lich` | Đề xuất/cập nhật thời gian xem phòng |
| PATCH | `/lich-xem/:maLichXem/huy` | Người đặt hoặc chủ trọ hủy lịch |

## 15. API TIN ĐĂNG PHÒNG

**Phụ trách: Thành viên 1 (Hùng)**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/tin-dang` | Tìm tin đã đăng; hỗ trợ `tu-khoa`, `tinh`, `quan`, `gia-tu`, `gia-den`, `dien-tich-tu`, `dien-tich-den`, `lat`, `lng`, `ban-kinh-km`, `page`, `limit`, `sap-xep` |
| GET | `/tin-dang/:maTinDang` | Xem chi tiết tin công khai |
| POST | `/tin-dang` | Chủ trọ tạo tin gắn với phòng và ảnh đã tải lên |
| PUT | `/tin-dang/:maTinDang` | Chủ tin cập nhật nội dung tin |
| PATCH | `/tin-dang/:maTinDang/trang-thai` | Đăng hoặc ẩn tin |
| DELETE | `/tin-dang/:maTinDang` | Xóa tin do chủ tin sở hữu |

Landing page dùng danh sách tin nổi bật từ `GET /tin-dang` và nội dung mới từ `GET /bai-viet`; không cần tạo endpoint riêng `/trang-chu`.

## 16. API TÌM NGƯỜI Ở GHÉP

**Phụ trách: Thành viên 1 (Hùng)**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/ho-so-o-ghep` | Tìm hồ sơ công khai; hỗ trợ lọc khu vực, ngân sách, thời gian chuyển vào và tọa độ bản đồ |
| GET | `/ho-so-o-ghep/cua-toi` | Lấy hồ sơ ở ghép của tài khoản hiện tại |
| GET | `/ho-so-o-ghep/:maHoSo` | Xem hồ sơ công khai theo mã (khai báo sau route `/cua-toi`) |
| POST | `/ho-so-o-ghep` | Tạo hồ sơ tìm người ở ghép |
| PUT | `/ho-so-o-ghep/cua-toi` | Cập nhật hồ sơ của tài khoản hiện tại |
| DELETE | `/ho-so-o-ghep/cua-toi` | Gỡ hồ sơ của tài khoản hiện tại khỏi kết quả tìm kiếm |

## 17. API BẢNG TIN VÀ ĐÁNH GIÁ PHÒNG

**Phụ trách: Thành viên 1 (Hùng)**

### Bảng tin

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/bai-viet` | Lấy danh sách bài viết/tin sự kiện; hỗ trợ `page`, `limit`, `tu-khoa` |
| GET | `/bai-viet/:maBaiViet` | Xem chi tiết bài viết |
| POST | `/bai-viet` | Tạo bài viết theo quyền được cấp |
| PUT | `/bai-viet/:maBaiViet` | Cập nhật bài viết do tài khoản sở hữu/quản trị |
| DELETE | `/bai-viet/:maBaiViet` | Xóa bài viết do tài khoản sở hữu/quản trị |

### Đánh giá phòng

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/danh-gia-phong?ma-phong=...` | Lấy danh sách đánh giá của một phòng |
| GET | `/danh-gia-phong/:maDanhGia` | Xem chi tiết đánh giá |
| POST | `/danh-gia-phong` | Tạo đánh giá cho phòng |
| PUT | `/danh-gia-phong/:maDanhGia` | Cập nhật đánh giá của chính người viết |
| DELETE | `/danh-gia-phong/:maDanhGia` | Xóa đánh giá theo quyền sở hữu/quản trị |

## 18. API THÔNG BÁO

**Phụ trách: Thành viên 1 (Hùng)**

| Phương thức | Đường dẫn API | Chức năng |
|---|---|---|
| GET | `/thong-bao` | Lấy danh sách thông báo của tài khoản hiện tại; hỗ trợ `page`, `limit` |
| GET | `/thong-bao/chua-doc` | Lấy số lượng và danh sách thông báo chưa đọc |
| PATCH | `/thong-bao/:maThongBao/da-doc` | Đánh dấu một thông báo đã đọc |
| PATCH | `/thong-bao/da-doc-tat-ca` | Đánh dấu tất cả thông báo của tài khoản hiện tại đã đọc |

## 19. Quy tắc nghiệp vụ

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
11. Chỉ tin đang ở trạng thái đã đăng mới xuất hiện trong kết quả tìm kiếm công khai.
12. Người dùng chỉ được xem/sửa/xóa tin đăng, hồ sơ ở ghép, bài viết, đánh giá và thông báo thuộc quyền của mình.
13. Người thuê chỉ được xem lịch hẹn do mình đặt; chủ trọ chỉ được xem lịch hẹn của phòng mình quản lý.

## 20. Quy ước lập trình

- Tên file: tiếng Việt không dấu.
- Tên biến và hàm: camelCase.
- Tên Model: PascalCase.
- Tên API: tiếng Việt không dấu.
- Dữ liệu trao đổi giữa Frontend và Backend: JSON.
- Tất cả API phải kiểm tra dữ liệu đầu vào.
- API cần bảo vệ phải kiểm tra đăng nhập và phân quyền.
- Các lỗi phải được xử lý thông qua Middleware.

## 21. Quy trình phối hợp nhóm

### Thành viên 1

- Thiết kế Database toàn dự án.
- Thiết kế API toàn dự án.
- Lập trình API quản lý dịch vụ và đơn giá.
- Lập trình API điện nước.
- Lập trình API hóa đơn.
- Lập trình API thống kê và các API bổ sung theo Figma ở mục 14–18.
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
- Lập trình API yêu cầu sửa chữa.
- Xây dựng giao diện tương ứng.

### Quy định chung

- Mọi thay đổi API phải được thống nhất trong nhóm.
- Mỗi thành viên tự kiểm thử API mình phụ trách.
- Các thành viên phải kiểm thử tích hợp trước khi hoàn thành.
- Không commit trực tiếp lên nhánh main.
- Mỗi chức năng cần được kiểm tra trước khi tạo Pull Request.
