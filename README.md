# Ready.vn — Website Đội Bóng

> Landing page giới thiệu đội bóng Ready.vn — đội bóng trẻ trung, đầy nhiệt huyết tại TP.HCM.

## 🌐 Giới Thiệu

Website static landing page cho đội bóng Ready.vn, được xây dựng bằng HTML, CSS, JavaScript thuần (không framework). Thiết kế responsive, modern với hiệu ứng animation đẹp mắt.

## 🚀 Chạy Local

Đây là static site, có thể mở trực tiếp hoặc dùng server đơn giản:

### Cách 1: Mở trực tiếp
Mở file `index.html` bằng trình duyệt web.

### Cách 2: Dùng Live Server (VS Code)
1. Cài extension **Live Server** trong VS Code
2. Chuột phải vào `index.html` → **Open with Live Server**

### Cách 3: Dùng Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Sau đó mở trình duyệt: http://localhost:8000
```

### Cách 4: Dùng Node.js
```bash
npx serve .
```

## 📁 Cấu Trúc Thư Mục

```
ready-vn-website/
├── index.html          # Trang HTML chính
├── css/
│   └── style.css       # Toàn bộ CSS styles
├── js/
│   └── main.js         # Toàn bộ JavaScript
├── README.md           # File này
└── .gitignore          # Git ignore rules
```

## 🎨 Sections

| Section | Mô tả |
|---------|--------|
| **Hero** | Banner chính với background ảnh & CTA button |
| **Giới Thiệu** | Thông tin về đội bóng + thống kê nhanh |
| **Đội Ngũ** | Danh sách thành viên (placeholder) |
| **Thành Tích** | Các thành tích nổi bật (placeholder) |
| **Sự Kiện** | Lịch sự kiện sắp tới |
| **Thư Viện Ảnh** | Gallery ảnh hoạt động (placeholder) |
| **Liên Hệ** | Form liên hệ + thông tin SĐT, email, Facebook |

## 🛠 Công Nghệ

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, Animations
- **JavaScript** — Vanilla JS (ES5+ compatible)
- **Google Fonts** — Poppins, Orbitron
- **Font Awesome 6** — Icons
- **AOS** — Animate on Scroll library

## 📱 Responsive

Website tương thích tốt trên:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)
- Small mobile (< 480px)

## ♿ Accessibility

- ARIA labels cho navigation, buttons
- Alt text cho tất cả hình ảnh
- Semantic HTML5 elements
- Hỗ trợ `prefers-reduced-motion`

## 📞 Liên Hệ

- **SĐT:** 03969 11286
- **Email:** ductv112@gmail.com
- **Facebook:** [Ready.vn Group](https://www.facebook.com/groups/880013402123211)

---

© 2026 Ready.vn
