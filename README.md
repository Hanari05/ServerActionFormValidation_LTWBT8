# Form "Góp ý khách hàng" với Zod và Server Actions

Bài làm xây dựng form **Góp ý khách hàng** trên nền ứng dụng **Nexus Social Network** (Next.js App Router, TypeScript, PostgreSQL). Dữ liệu nhập vào được kiểm tra bằng **Zod** ở cả client và server.

## 1. Đề bài

- **Nhiệm vụ:** Mỗi nhóm tạo một form "Góp ý khách hàng".
- **Yêu cầu:** Dùng Zod để kiểm tra dữ liệu:
  - Trường **"Nội dung"** phải trên 20 ký tự.
  - Trường **"Số điện thoại"** phải đúng định dạng số điện thoại Việt Nam.
- **Tiêu chí chấm điểm:** Nhập dữ liệu sai để kiểm tra các thông báo validation, gồm nội dung không vượt quá 20 ký tự và số điện thoại không đúng định dạng Việt Nam; trình bày kết quả kiểm tra và thông báo lỗi trên form.

## 2. Kết quả đạt được

| Yêu cầu | Cách thực hiện | Trạng thái |
|---|---|---|
| Form "Góp ý khách hàng" | Trang `/feedback`, có link từ trang đăng nhập | Hoàn thành |
| Dùng Zod | `feedbackSchema` trong `lib/validations/feedback.ts` | Hoàn thành |
| "Nội dung" trên 20 ký tự | Tối thiểu 21 ký tự, báo lỗi nếu ngắn hơn | Hoàn thành |
| "Số điện thoại" đúng định dạng VN | Regex số di động Việt Nam, có chuẩn hóa dữ liệu nhập | Hoàn thành |
| Hiển thị thông báo lỗi trên form | Lỗi hiện ngay dưới từng ô nhập | Hoàn thành |
| Validate phía server | Server Action gọi lại `safeParse` | Hoàn thành |

## 3. Quy tắc validation

### Trường "Nội dung"

- Không được để trống (khoảng trắng đầu/cuối bị bỏ trước khi kiểm tra).
- Phải **trên 20 ký tự** (tối thiểu 21). Nhập đúng 20 ký tự vẫn bị báo lỗi.
- Tối đa 1000 ký tự.
- Văn bản được chuẩn hóa Unicode (NFC) và đếm theo ký tự hiển thị, nên chữ tiếng Việt có dấu và emoji đều được đếm là 1 ký tự.

### Trường "Số điện thoại"

- Không được để trống.
- Chỉ nhận số **di động** Việt Nam, một trong các dạng `0xxxxxxxxx`, `84xxxxxxxxx` hoặc `+84xxxxxxxxx`.
- Đầu số hợp lệ: `03x`, `05x`, `07x`, `08x`, `09x`.
- Cho phép nhập có dấu cách, dấu chấm hoặc gạch ngang, ví dụ `0912 345 678`. Schema chuẩn hóa về `0912345678` trước khi Server Action nhận dữ liệu.
- Số điện thoại bàn (`02x`) chưa được hỗ trợ.

Regex sử dụng (áp dụng sau khi bỏ dấu cách, dấu chấm, gạch ngang):

```ts
/^(?:0|\+?84)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9])\d{7}$/
```

### Thông báo lỗi

| Trường | Tình huống | Thông báo hiển thị |
|---|---|---|
| Nội dung | Để trống hoặc chỉ có khoảng trắng | Vui lòng nhập nội dung góp ý. |
| Nội dung | Từ 1 đến 20 ký tự | Nội dung góp ý phải trên 20 ký tự. |
| Nội dung | Quá 1000 ký tự | Nội dung góp ý không được vượt quá 1000 ký tự. |
| Số điện thoại | Để trống | Vui lòng nhập số điện thoại. |
| Số điện thoại | Sai định dạng | Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678 hoặc +84912345678). |

## 4. Cách hoạt động

Form dùng **cùng một schema Zod** cho hai lớp kiểm tra:

1. **Client:** `react-hook-form` kết hợp `zodResolver(feedbackSchema)`. Form kiểm tra khi người dùng rời khỏi ô (`onBlur`) và kiểm tra lại mỗi lần gõ sau đó (`onChange`). Form có `noValidate` nên thông báo lỗi đến từ Zod, không phải từ trình duyệt.
2. **Server:** `submitFeedbackAction` nhận `input: unknown` và gọi `feedbackSchema.safeParse(input)`. Không tin dữ liệu từ client vì người dùng có thể bỏ qua giao diện và gọi action trực tiếp. Nếu sai, action trả về `{ status: "error", fieldErrors }`; form gắn lỗi vào đúng ô bằng `setError`.
3. **Thành công:** action trả về `{ status: "success", formSuccess }`, form hiện thông báo thành công và xóa nội dung đã nhập.

Dữ liệu góp ý hiện **chưa được lưu vào database** vì đề bài chỉ yêu cầu kiểm tra dữ liệu. Muốn lưu, thêm bảng `feedbacks` vào `sql/schema.sql` rồi insert `parsed.data` trong `submitFeedbackAction`.

## 5. Các file liên quan

| File | Vai trò |
|---|---|
| `lib/validations/feedback.ts` | Schema Zod `feedbackSchema`, regex số điện thoại, hàm chuẩn hóa nội dung và số điện thoại |
| `app/actions/feedback.ts` | Server Action `submitFeedbackAction`, validate lại ở server |
| `components/forms/FeedbackForm.tsx` | Form dùng react-hook-form, hiển thị lỗi từng ô và bộ đếm ký tự |
| `app/(auth)/feedback/page.tsx` | Trang `/feedback` |
| `app/(auth)/login/page.tsx` | Thêm liên kết "Góp ý khách hàng" |
| `lib/types/forms.ts` | Kiểu `FormActionState` dùng chung cho các Server Action |
| `components/ui/FormAlert.tsx`, `components/ui/SubmitButton.tsx` | Thành phần giao diện dùng lại |

## 6. Hướng dẫn chạy

Yêu cầu: Node.js 20 trở lên, Docker (cho PostgreSQL).

1. Tạo `.env.local` từ `.env.example` và điền cấu hình PostgreSQL.
2. Chạy PostgreSQL: `docker compose --env-file .env.local up -d`.
3. Khởi tạo database bằng `sql/schema.sql` nếu database chưa có bảng (PowerShell):

   ```powershell
   Get-Content -Raw .\sql\schema.sql | docker compose --env-file .env.local exec -T postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
   ```

4. Cài dependency: `npm ci`.
5. Chạy ứng dụng: `npm run dev`, sau đó mở `http://localhost:3000/feedback`.

Kiểm tra mã nguồn: `npm run typecheck` và `npm run lint`.

> Trang `/feedback` không truy cập database nên vẫn hiển thị khi chưa cấu hình PostgreSQL. Các trang đăng nhập, đăng ký và feed thì cần database.

## 7. Kết quả kiểm tra

Truy cập `/feedback` và nhập lần lượt các giá trị dưới đây.

### Trường "Nội dung"

| Giá trị nhập | Kết quả |
|---|---|
| *(để trống)* hoặc toàn dấu cách | Lỗi: Vui lòng nhập nội dung góp ý. |
| `Quá ngắn` | Lỗi: Nội dung góp ý phải trên 20 ký tự. |
| `aaaaaaaaaaaaaaaaaaaa` (đúng 20 ký tự) | Lỗi: Nội dung góp ý phải trên 20 ký tự. |
| `aaaaaaaaaaaaaaaaaaaaa` (21 ký tự) | Hợp lệ |
| `Dịch vụ rất tốt, nhân viên nhiệt tình!` | Hợp lệ |

### Trường "Số điện thoại"

| Giá trị nhập | Kết quả |
|---|---|
| *(để trống)* | Lỗi: Vui lòng nhập số điện thoại. |
| `123` | Lỗi: sai định dạng |
| `091234567` (thiếu số) | Lỗi: sai định dạng |
| `09123456789` (thừa số) | Lỗi: sai định dạng |
| `0112345678` (đầu số không tồn tại) | Lỗi: sai định dạng |
| `+840912345678` (thừa số 0 sau +84) | Lỗi: sai định dạng |
| `0912abc678` | Lỗi: sai định dạng |
| `0912345678` | Hợp lệ |
| `091 234 5678`, `0912.345.678`, `0912-345-678` | Hợp lệ (chuẩn hóa về `0912345678`) |
| `+84912345678`, `84912345678` | Hợp lệ |

### Hình ảnh minh họa

*(Chèn ảnh chụp màn hình các trường hợp trên, ví dụ:)*

- `docs/nhap-sai-noi-dung.png`: nội dung 20 ký tự bị báo lỗi.
- `docs/nhap-sai-so-dien-thoai.png`: số điện thoại sai định dạng bị báo lỗi.
- `docs/gui-thanh-cong.png`: gửi thành công với dữ liệu hợp lệ.

## 8. Cấu trúc dự án

```text
├── app/
│   ├── (auth)/              # Đăng nhập, đăng ký, góp ý khách hàng và layout xác thực
│   ├── actions/             # Server Actions: auth, posts, feedback
│   ├── feed/                # Trang feed được bảo vệ bởi session
│   ├── globals.css          # Style dùng chung
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Chuyển / sang /login
├── components/
│   ├── feed/                # Header, danh sách và thẻ bài viết
│   ├── forms/               # Form đăng ký, đăng nhập, góp ý, đăng/xóa bài, đăng xuất
│   └── ui/                  # Nút submit và thông báo dùng lại
├── lib/
│   ├── auth/                # Hash mật khẩu và quản lý session
│   ├── data/                # Query users, sessions và posts
│   ├── demo/                # Cờ bật/tắt demo SQL injection local
│   ├── server/              # Kết nối PostgreSQL
│   ├── types/               # Kiểu dữ liệu dùng chung
│   └── validations/         # Schema Zod: auth, post, feedback
├── public/                  # icon.png và background.png
├── sql/schema.sql           # Schema PostgreSQL
├── scripts/                 # Script tạo dữ liệu demo
├── docker-compose.yml       # PostgreSQL local
└── .env.example             # Mẫu biến môi trường
```

Các route:

| Route | Chức năng |
|---|---|
| `/` | Chuyển hướng sang `/login` |
| `/register` | Đăng ký tài khoản |
| `/login` | Đăng nhập và tạo session |
| `/feedback` | Form "Góp ý khách hàng" (không cần đăng nhập) |
| `/feed` | Xem feed, đăng bài, xóa bài của mình và đăng xuất |


## Phụ lục: Demo SQL injection ở trang đăng nhập (tùy chọn, chỉ chạy local)

Phần này thuộc dự án nền, không liên quan đến form góp ý. Mặc định `ENABLE_UNSAFE_LOGIN_SQL_DEMO` trong `lib/demo/security.ts` là `false`: đăng nhập dùng parameterized query và bcrypt.

Để demo, chạy `node --env-file=.env.local scripts/setup-login-demo.cjs`, đổi cờ thành `true`, rồi chạy `npm run dev`. Script tạo bảng tài khoản giả và hai hồ sơ `sql_demo_a`, `sql_demo_b`.

- Demo 1: email `demo_a@example.com`, mật khẩu `' OR email = 'demo_a@example.com' --`.
- Demo 2: email `khongtontai@example.com`, mật khẩu `' OR 1=1 --`.

Đăng xuất giữa các lần thử. Sau demo, **đổi cờ về `false`**; đổi cờ không tự xóa session hiện có. Action demo bị vô hiệu hóa khi chạy production.
