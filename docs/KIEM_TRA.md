# Kết quả kiểm tra ngày 08/10/2026

- `npm run test:feedback`: PASS, 48 kiểm tra với Zod thật. Tầng lưu dữ liệu được mô phỏng trong bộ test này.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, không có warning/error từ ESLint. Next.js 15.5 có thông báo deprecation của lệnh `next lint`.
- `npm run build`: PASS; trang `/feedback` được build thành công.

## Kiểm tra tích hợp trên trình duyệt

Chạy bản production bằng Next.js 15.5.23 và Microsoft Edge headless. Database thử nghiệm là PostgreSQL/WASM (PGlite) kết nối qua giao thức PostgreSQL bằng thư viện `pg`; không sử dụng database thật của người dùng. Đây là kiểm tra tích hợp tại môi trường thử nghiệm, không thay thế kiểm tra cấu hình PostgreSQL/Docker của máy triển khai.

| Tình huống | Kết quả thực tế |
|---|---|
| Nội dung đúng 20 ký tự, điện thoại hợp lệ | Hiển thị lỗi nội dung; không thêm bản ghi |
| Nội dung hợp lệ, điện thoại `123` | Hiển thị lỗi điện thoại; không thêm bản ghi |
| Emoji gia đình lặp 21 lần, điện thoại `+84 24 1234 5678` | Gửi thành công; đọc lại database thấy đúng 21 emoji và `+842412345678` |
| Nội dung có dấu nháy đơn, điện thoại `0912 345 678` | Gửi thành công; lưu bản ghi bằng query có tham số |
| Tạm làm bảng góp ý không khả dụng trong database thử nghiệm | Báo lỗi lưu dữ liệu; giữ nguyên nội dung và điện thoại; không hiện thông báo thành công |
| Viewport mobile 390 × 844 | Không tràn ngang; các trường và nút gửi hiển thị đầy đủ |
| Lỗi JavaScript trên trình duyệt | Không ghi nhận |
| Chạy schema mới và chạy lại migration `sql/feedback.sql` hai lần | Thành công, migration không xóa dữ liệu/bảng cũ |

## Ảnh minh chứng

- [Lỗi nội dung](nhap-sai-noi-dung.png)
- [Lỗi số điện thoại](nhap-sai-so-dien-thoai.png)
- [Gửi và lưu thành công](gui-thanh-cong.png)
- [Lỗi lưu dữ liệu](loi-luu-du-lieu.png)
- [Giao diện mobile](giao-dien-mobile.png)

## Chạy trên database hiện có

Tạo/cập nhật `.env.local` theo `.env.example` và chạy `sql/feedback.sql` theo lệnh trong README trước khi gửi góp ý. Không chạy lại toàn bộ `sql/schema.sql` nếu database đã có bảng `users`, `posts`, `sessions`.
