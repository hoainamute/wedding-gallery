# Wedding Gallery — An & Minh

Website gallery cưới responsive, thiết kế để nhiều khách cùng xem và gửi ảnh.

## Kiến trúc production

```
Khách truy cập → Cloudflare Pages / Vercel (frontend tĩnh)
                          ↓
                  Supabase Auth (admin/khách mời)
                          ↓
       Postgres (albums, photos, approvals) + Storage (ảnh gốc/webp)
                          ↓
              CDN + ảnh ký URL cho album riêng tư
```

- **Khách** chỉ xem album đã công khai hoặc có mã mời.
- **Người gửi ảnh** tải trực tiếp đến Storage bằng signed upload URL; ảnh ở trạng thái `pending`.
- **Admin** duyệt ảnh; chính sách Row Level Security ngăn người khác xem file chưa duyệt.
- Khi dùng thật, nên tạo ảnh thu nhỏ WebP qua Supabase Edge Function để giảm chi phí băng thông.

## Chạy thử

Mở `index.html` trực tiếp, hoặc chạy bằng bất kỳ static server nào. Bản hiện tại dùng ảnh mẫu để có thể trình diễn ngay.

## Đưa dữ liệu thật vào Supabase

1. Tạo một dự án Supabase, mở SQL Editor và chạy `supabase/schema.sql`.
2. Tạo Storage bucket private tên `wedding-photos`.
3. Kết nối frontend với Supabase JS (URL + publishable key) và thay handler tải ảnh trong `app.js` bằng signed upload URL. Không đặt service-role key ở frontend.
4. Deploy thư mục này lên Cloudflare Pages hoặc Vercel. Với album riêng tư, đặt biến môi trường tại nền tảng deploy.

Không lưu ảnh cưới chỉ trong GitHub Pages: ảnh có thể bị công khai và không phù hợp cho dữ liệu cá nhân.
