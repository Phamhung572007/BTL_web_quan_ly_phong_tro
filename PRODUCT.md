# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Chủ trọ quản lý dãy/phòng, người thuê, dịch vụ, chỉ số điện nước, hóa đơn, lịch xem và nội dung cộng đồng.
- Người thuê và người đang tìm phòng dùng các luồng công khai, lịch xem, hóa đơn cá nhân, đánh giá và thông báo.

## Product Purpose

StaySync là ứng dụng web quản lý nhà trọ và hỗ trợ người dùng tìm, thuê, theo dõi việc ở trọ. Thành công trong phạm vi hiện tại là chủ trọ xử lý được công việc thường ngày trên cùng một hệ thống, còn người thuê và khách xem được thông tin gắn với đúng phòng và tài khoản.

## Positioning

Chưa có cơ chế khác biệt hoặc định vị cạnh tranh được xác nhận. Không tự thêm tuyên bố về quy mô, độ tin cậy, mức giá hay kết quả kinh doanh.

## Operating Context

Chủ trọ thường xuyên theo dõi trạng thái phòng, ghi chỉ số theo kỳ, tính và phát hành hóa đơn, ghi nhận thanh toán, xử lý lịch xem và cập nhật thông tin cộng đồng. Các trang vận hành thuộc một khu vực chủ trọ thống nhất. Người thuê chỉ được xem dữ liệu gắn với tài khoản/phòng của mình.

## Capabilities and Constraints

- Stack hiện có: React, Vite, React Router, Axios; Node.js, Express và Mongoose.
- MongoDB Atlas là nơi lưu dữ liệu ứng dụng; backend chỉ giữ cấu hình kết nối và xử lý nghiệp vụ API.
- Công việc chia giữa ba thành viên. Hùng sở hữu nền tảng backend dùng chung, dịch vụ, chỉ số điện nước, hóa đơn, thống kê, lịch xem, bảng tin, đánh giá và thông báo. Các module dãy/phòng/hợp đồng/tin đăng và tài khoản/người thuê/sửa chữa/ở ghép thuộc các thành viên khác.
- Không viết lại model, controller hoặc route thuộc module của thành viên 2 và 3. Dữ liệu tham chiếu giữa các module dùng các collection hiện có và tích hợp qua ID.
- Hóa đơn và điện nước phải được tính ở backend; mỗi phòng chỉ có một hóa đơn trong một kỳ; chỉ số mới không thấp hơn chỉ số cũ.

## Brand Commitments

- Tên sản phẩm được thể hiện trong thiết kế là StaySync.
- Các màn chủ trọ đã cung cấp dùng thanh điều hướng bên trái, nền sáng, bảng nghiệp vụ và màu xanh lam cho thao tác/hàng trạng thái; các màn công khai dùng nhận diện xanh lá riêng. Giữ phân biệt hai vùng này khi chuẩn hóa giao diện chủ trọ.

## Evidence on Hand

- Tài liệu cấu trúc và phân công nhóm: `khung dự án.txt`, `phân chia công việc.txt`, `TAI_LIEU_API.md`.
- Ảnh/Figma StaySync do người dùng cung cấp trong cuộc trò chuyện cho luồng đăng nhập, quản lý nhà trọ, dịch vụ, hóa đơn, thống kê, lịch xem, tìm phòng và cộng đồng.
- Bộ dữ liệu mẫu trong `backend/database/du_lieu_mau/` là dữ liệu tổng hợp; không xem đó là bằng chứng về khách hàng, giá dịch vụ thực tế hoặc kết quả kinh doanh.

## Product Principles

- Làm rõ việc cần xử lý hôm nay và trạng thái của nó.
- Tính tiền ở backend và lưu dấu vết đầu vào để có thể đối chiếu.
- Giữ quyền sở hữu dữ liệu theo chủ trọ, người thuê và phòng.
- Cho phép chủ trọ xử lý nhanh các thao tác lặp theo kỳ.
- Không tạo dữ liệu hoặc tuyên bố kinh doanh giả như dữ kiện thật.
