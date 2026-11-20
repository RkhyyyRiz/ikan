# Budi Daya Ikan Kalbar

Toko online ikan budidaya: Next.js 15 (App Router, TypeScript), Tailwind CSS, Supabase (PostgreSQL, Auth OTP email 6 digit, Storage). Siap deploy ke Vercel.

## 1. Siapkan Supabase
1. Buat project di supabase.com.
2. Buka **SQL Editor**, tempel seluruh isi `supabase/schema.sql`, lalu jalankan. Ini membuat tabel, trigger, RPC (`create_fish_order`, `cancel_fish_order`, dst.), RLS, dan bucket `fish-photos` & `payment-proofs`.
3. **Authentication → Providers → Email**: aktifkan *Confirm email*.
4. **Authentication → Email Templates → Confirm signup**: ganti isi template dengan kode OTP:

   ```html
   <h2>Kode verifikasi Budi Daya Ikan Kalbar</h2>
   <p>Masukkan kode 6 digit berikut di aplikasi:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>Kode berlaku sebentar. Abaikan email ini jika Anda tidak mendaftar.</p>
   ```
   Pastikan panjang OTP 6 digit (Authentication → Providers → Email → *Email OTP Length* = 6).
5. **Authentication → URL Configuration**: isi *Site URL* dengan `NEXT_PUBLIC_SITE_URL` Anda dan tambahkan URL `.vercel.app` ke *Redirect URLs*.
6. Untuk email produksi, pasang SMTP sendiri (Project Settings → Auth → SMTP); SMTP bawaan Supabase sangat dibatasi.

## 2. Jalankan lokal
```bash
cp .env.example .env.local   # isi nilainya
npm install
npm run dev
```

## 3. Variabel lingkungan
| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (dev) atau URL `.vercel.app` / domain sendiri |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Hanya server; dipakai membuat tautan bukti bayar di panel admin. Jangan diberi awalan `NEXT_PUBLIC` |
| `NEXT_PUBLIC_QRIS_IMAGE_URL` | URL gambar QRIS statis |
| `NEXT_PUBLIC_PAYMENT_ACCOUNT_INFO` | Info rekening; pisahkan baris dengan `\n` |

## 4. Jadikan akun admin
Daftar lewat `/register`, verifikasi OTP, lalu di SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'email-anda@contoh.com';
```

## 5. Deploy ke Vercel
Impor repo, isi semua variabel di atas (Settings → Environment Variables), lalu deploy. Setelah URL `.vercel.app` jadi, perbarui `NEXT_PUBLIC_SITE_URL` dan Redirect URLs di Supabase. Domain sendiri nanti cukup mengganti `NEXT_PUBLIC_SITE_URL`.

## Catatan desain
- Harga dihitung ulang di server (`create_fish_order`); tampilan di browser hanya pratinjau.
- Satu pesanan berisi satu jenis ikan (sesuai drawer pesan); tabel `order_items` sudah siap untuk multi-item.
- Bukti bayar disimpan sebagai path privat dan ditampilkan lewat signed URL (1 jam).
