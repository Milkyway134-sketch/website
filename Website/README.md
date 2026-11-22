# Ervo — Galaxy Purple Portfolio

Website portofolio personal menggunakan Python Flask, HTML, CSS, dan JavaScript.

## Menjalankan di Windows

1. Ekstrak ZIP.
2. Buka folder `ervo_galaxy_portfolio` di VS Code.
3. Buka Terminal pada folder tersebut.
4. Buat virtual environment (opsional tetapi disarankan):

   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

5. Install Flask:

   ```bash
   pip install -r requirements.txt
   ```

6. Jalankan website:

   ```bash
   python app.py
   ```

7. Buka browser ke `http://127.0.0.1:5002`.

## Personalisasi sebelum dipublikasikan

- Ganti `62XXXXXXXXXXX` pada link WhatsApp di `templates/index.html` dengan nomor WhatsApp admin/Anda, format internasional tanpa tanda `+`.
- Email kontak saat ini adalah `vvynn532@gmail.com`; ubah di `templates/index.html` bila perlu.
- Ubah deskripsi, skill, pendidikan, dan proyek contoh agar sesuai data asli.
- Tambahkan tautan GitHub, LinkedIn, atau media sosial bila diperlukan.

Website ini belum memakai database atau formulir backend. Tombol kontak memakai tautan WhatsApp dan email.
