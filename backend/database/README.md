# Bộ dữ liệu demo MongoDB Atlas

Thư mục `du_lieu_mau` có 15 file JSON Extended JSON v2, **50 tài liệu cho mỗi collection (750 tài liệu tổng cộng)**. Các ID `ObjectId` và ngày giờ được liên kết xuyên collection để demo danh sách dãy/phòng, người thuê, hợp đồng, tin đăng, lịch xem, sửa chữa, điện nước, hóa đơn, ở ghép, bài viết, đánh giá và thông báo.

Tất cả tài khoản, email `example.invalid`, số điện thoại, CCCD, hợp đồng, chỉ số và giao dịch là **dữ liệu giả lập**. Tin đăng, hồ sơ và nội dung đều được đánh dấu `[DEMO]` hoặc mô tả là dữ liệu mẫu. Không dùng dữ liệu nhận dạng giả này cho vận hành thật.

## Biểu giá và cách tính điện nước

Giá trong demo là giá tham khảo theo biểu công khai năm 2026. Giá điện sinh hoạt dưới đây áp dụng từ 01/11/2026 theo Quyết định 2892/QĐ-BCT, chưa gồm VAT:

| Bậc điện | Sản lượng trong bậc | Giá (đồng/kWh) |
|---:|---:|---:|
| 1 | Đến 100 kWh | 1.901 |
| 2 | Trên 100 đến 200 kWh | 2.289 |
| 3 | Trên 200 đến 400 kWh | 2.894 |
| 4 | Trên 400 đến 700 kWh | 3.456 |
| 5 | Trên 700 kWh | 3.844 |

Với phòng trọ, ngưỡng điện sinh hoạt cần nhân theo định mức người sử dụng đã kê khai: cứ 4 người tương ứng một định mức hộ. Demo giả định 1 người đã kê khai trong mỗi phòng, nên `heSoDinhMuc` là `0.25`. Nếu người thuê không được kê khai theo quy định, cách áp giá có thể khác; `cachApGia` trong dữ liệu hỗ trợ `DON_GIA_BAC_2` để biểu diễn trường hợp áp đơn giá bậc 2 cho toàn bộ sản lượng. Xác nhận cách áp dụng với đơn vị điện lực trước khi dùng số liệu thật.

Ví dụ 150 kWh với một người đã kê khai: 25×1.901 + 25×2.289 + 50×2.894 + 50×3.456 = **422.250 đồng**, chưa thuế.

Giá nước khác nhau theo địa phương:

| Khu vực | Ngưỡng tính | Giá nước sạch (đồng/m³) |
|---|---|---:|
| Hà Nội | Đến 10 m³/đồng hồ/tháng | 8.500 |
| Hà Nội | Trên 10 đến 20 m³ | 9.900 |
| Hà Nội | Trên 20 đến 30 m³ | 16.000 |
| Hà Nội | Trên 30 m³ | 27.000 |
| TP.HCM | Đến 4 m³/người/tháng | 6.700 |
| TP.HCM | Trên 4 đến 6 m³/người/tháng | 12.900 |
| TP.HCM | Trên 6 m³/người/tháng | 14.400 |

Ví dụ nước Hà Nội 17 m³: 10×8.500 + 7×9.900 = **154.300 đồng**, chưa VAT và phí môi trường nước thải. Giá TP.HCM trong demo là giá nước sạch; VAT và phí thoát nước/xử lý nước thải được tính riêng theo thông báo của đơn vị cấp nước. Biểu giá thực tế còn phụ thuộc nhà cung cấp, định mức đã đăng ký và hóa đơn địa phương.

Mỗi document điện/nước trong `chisosdiennuocs.json` lưu biểu giá nguồn trong `bacGia`, hệ số định mức, số người và kết quả từng bậc trong `chiTietBac`. Hóa đơn trong `hoadons.json` lưu bản chụp phép tính tại thời điểm lập hóa đơn. Phép tính dùng chung nằm trong `backend/services/tinh_tien_bac_thang.js`; hóa đơn giữ lại chi tiết để không đổi khi biểu giá về sau thay đổi.

## Nguồn biểu giá

- [Bộ Công Thương — Quyết định 2892/QĐ-BCT, biểu giá điện áp dụng từ 01/11/2026](https://www.evn.com.vn/userfile/User/tcdl/files/2026/11/1_QD-BCT_2026_2892-20261104131123509.pdf)
- [EVN — thay đổi biểu giá điện sinh hoạt và nhóm bậc từ 01/11/2026](https://www.evn.com.vn/d/vi-VN/news/EVN-thong-tin-ve-viec-thuc-hien-chinh-sach-gia-dien-tu-ngay-1112026-60-3557-510202)
- [Bộ Công Thương — Thông tư 60/2025/TT-BCT về định mức điện và người thuê nhà](https://moit.gov.vn/upload/2005517/20251203/Thong_tu_60_2025_TT-BCT_quy_dinh_ve_thuc_hien_gia_ban_dien__1__a3a02.pdf)
- [HAWACOM — biểu giá nước sinh hoạt Hà Nội năm 2026](https://hawacom.vn/public/index.php/thong-tin-gia-nuoc)
- [Cấp nước Tân Hòa — thông báo giá nước TP.HCM năm 2026](https://www.capnuoctanhoa.com.vn/images/2026/gia_nuoc_2026.pdf)

Giá nước TP.HCM trong dataset là dữ liệu tham khảo theo biểu đơn vị cấp nước công bố; cần xác nhận đúng công ty cấp nước phụ trách địa chỉ trước khi đưa ra hóa đơn thật. Toàn bộ giá trong bộ demo cần được thay bằng biểu giá có hiệu lực và thông tin khách thuê thực tế khi vận hành.

## Các collection

`nguoidungs`, `daytros`, `phongtros`, `nguoithues`, `hopdongs`, `dichvus`, `chisosdiennuocs`, `hoadons`, `yeucausuachuas`, `tindangphongs`, `lichxems`, `hosoogheps`, `baiviets`, `danhgiaphongs`, `thongbaos`.

## Import hoặc dựng lại database

Các file hiện là snapshot 50 tài liệu/collection và đã được nạp vào Atlas. Không chạy lại `mongoimport` lên database đã có dữ liệu vì sẽ trùng `_id`. Khi cần dựng database mới, chọn database rỗng `quan_ly_phong_tro`, rồi import từng file với `--jsonArray`; không dùng `--drop` trên database đang có dữ liệu.

Ví dụ PowerShell chạy từ thư mục gốc dự án:

```powershell
mongoimport --uri "<MONGODB_URI>" --db quan_ly_phong_tro --collection chisosdiennuocs --file "backend/database/du_lieu_mau/chisosdiennuocs.json" --jsonArray
```

Lặp lại với tên collection và file tương ứng. Xem [tài liệu mongoimport](https://www.mongodb.com/docs/database-tools/mongoimport/) và [hướng dẫn import JSON array](https://www.mongodb.com/docs/database-tools/mongoimport/mongoimport-guide/).
