# Sentinel Master v78 - Hệ Thống Quản Lý Chiến Dịch & Theo Dõi GPS

Chào mừng bạn đến với **Sentinel Master**, hệ thống quản lý link bẫy và thu thập dữ liệu vị trí chuyên nghiệp được xây dựng trên nền tảng Next.js 15.

## 🚀 Cách Chạy Ứng Dụng

### 1. Sử dụng Node.js (Khuyên dùng cho phát triển)

Đảm bảo bạn đã cài đặt Node.js phiên bản 18 trở lên.

*   **Bước 1: Cài đặt các thư viện cần thiết**
    ```bash
    npm install
    ```
*   **Bước 2: Chạy ở chế độ phát triển**
    ```bash
    npm run dev
    ```
    Truy cập ứng dụng tại: `http://localhost:3000`
*   **Bước 3: Xây dựng và chạy bản chính thức (Production)**
    ```bash
    npm run build
    npm start
    ```

### 2. Sử dụng Docker (Khuyên dùng cho triển khai thực tế)

Nếu máy bạn đã có Docker và Docker Compose:

*   **Khởi động hệ thống:**
    ```bash
    docker-compose up -d --build
    ```
*   **Dữ liệu:** Toàn bộ Link và Nhật ký sẽ được lưu trữ an toàn trong thư mục `logs/` và `src/data/` (đã được gắn Volume).

---

## 🔐 Thông Tin Truy Cập Admin

*   **Đường dẫn:** `http://localhost:3000/login`
*   **Tài khoản:** `admin`
*   **Mật khẩu:** `123`

## ✨ Các Tính Năng Chính

*   **Quản lý chiến dịch:** Tạo link bẫy với tiêu đề, mô tả và hình ảnh OG mồi cực chuẩn.
*   **Ghi log thông minh:** Tự động lấy IP ngay khi tải trang và yêu cầu GPS để lấy địa chỉ chữ Tiếng Việt đầy đủ.
*   **Bản đồ trực tiếp:** Xem vị trí "mục tiêu" ngay trên Google Maps tích hợp trong Dashboard.
*   **Thông báo Telegram:** Nhận tin nhắn báo cáo tức thì qua Bot Telegram.
*   **Tùy chỉnh giao diện:** Thay đổi chủ đề (Light, Dark, Forest, Sunset) và chèn mã HTML tùy chỉnh.

---
*Bảo mật bởi Sentinel Master v78 - Hệ thống hoạt động ổn định trên môi trường Next.js 15.*
