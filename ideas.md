# Ý tưởng Use Cases (UCS) cho Website

Bạn muốn thêm tính năng mới cho web (khoe project, blog, portfolio...). Dưới đây là vài đề xuất:

## 1. Guestbook (Sổ lưu bút)
- **Mô tả:** Nơi mọi người ghé thăm có thể để lại lời nhắn, sticker, hoặc ký tên.
- **Tính năng:**
    - Login qua Github/Google (để tránh spam).
    - Chọn sticker/emoji.
    - Hiển thị dạng feed hoặc "tường".
- **Tech:** Firebase/Supabase (realtime), Auth.js.

## 2. Music Player / "On Air"
- **Mô tả:** Widget hiển thị bài hát bạn đang nghe (Spotify/Apple Music) hoặc list nhạc lo-fi bạn hay nghe lúc code.
- **Tính năng:**
    - Widget nhỏ ở góc hoặc trên thanh menu.
    - Hiển thị trạng thái "Online/Coding/Sleeping".
- **Tech:** Spotify API, WebSocket.

## 3. Snippets / Cheatsheets Library
- **Mô tả:** Kho lưu trữ các đoạn code ngắn, config hay (vim, zsh, vscode settings) mà bạn hay dùng.
- **Lợi ích:** Vừa để mình dùng, vừa share cho cộng đồng (dev rất thích cái này).
- **Tính năng:**
    - Search nhanh.
    - Copy to clipboard.
    - Syntax highlighting.

## 4. Tech Stack Radar (Interactive)
- **Mô tả:** Thay vì liệt kê kỹ năng dạng text, làm một biểu đồ radar hoặc graph tương tác.
- **Tính năng:**
    - Phân loại: Thành thạo, Đang học, Muốn học.
    - Click vào node -> Ra các project sử dụng công nghệ đó.

## 5. /now Page
- **Mô tả:** Trang cập nhật "Hiện tại tôi đang làm gì?".
- **Nội dung:**
    - Sách đang đọc.
    - Project đang cày.
    - Mục tiêu tháng này.
- **Khác biệt:** About là tĩnh, Now là động (update hàng tuần/tháng).

## 6. Daily Journal / Micro-blog
- **Mô tả:** Dạng blog ngắn (như Twitter/Threads) nhưng trên nhà mình.
- **Mục đích:** Note nhanh suy nghĩ, idea, than thở chuyện code bug...

## 7. Interactive Resume (Timeline)
- **Mô tả:** CV dạng timeline cuộn dọc/ngang, có animation.
- **Tính năng:**
    - Click vào mốc thời gian -> Hiện chi tiết, ảnh, project liên quan.

---
**Bạn thích ý tưởng nào? Hay muốn một cái gì đó "dị" hơn (Vd: Game trên web, AI chat với chính bạn...)?**
