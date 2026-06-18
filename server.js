require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

const upload = multer({ storage: multer.memoryStorage() });

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

app.post('/api/send-inquiry', upload.single('screenshot'), async (req, res) => {
  const {
    visitorName,
    visitorEmail,
    visitorPhone,
    productName,
    quantity,
    message,
    timestamp,
  } = req.body;

  const screenshotData = req.body.screenshot;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Permintaan Produk Baru</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Diterima pada ${new Date(timestamp).toLocaleString('id-ID')}</p>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Data Pengunjung</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold; width: 35%; color: #555;">Nama</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; color: #333;">${visitorName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: bold; color: #555;">Email</td>
            <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; color: #333;">${visitorEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold; color: #555;">Telepon</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; color: #333;">${visitorPhone || '-'}</td>
          </tr>
        </table>

        <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 25px;">Detail Produk</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold; width: 35%; color: #555;">Produk</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; color: #333;">${productName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; font-weight: bold; color: #555;">Jumlah</td>
            <td style="padding: 10px; background: #f5f5f5; border: 1px solid #e0e0e0; color: #333;">${quantity} unit</td>
          </tr>
          <tr>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; font-weight: bold; color: #555;">Pesan</td>
            <td style="padding: 10px; background: white; border: 1px solid #e0e0e0; color: #333;">${message || '-'}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 20px 30px; background: #667eea; text-align: center;">
        <p style="color: white; margin: 0; font-size: 13px;">Email ini dikirim otomatis dari Form Produk Contoh</p>
      </div>
    </div>
  `;

  const attachments = [];
  if (screenshotData && screenshotData.startsWith('data:image')) {
    const base64Data = screenshotData.replace(/^data:image\/\w+;base64,/, '');
    attachments.push({
      filename: `screenshot-${Date.now()}.png`,
      content: base64Data,
      encoding: 'base64',
      contentType: 'image/png',
    });
  }

  const mailOptions = {
    from: `"Form Produk" <${process.env.EMAIL_USER}>`,
    to: 'solihunas@gmail.com',
    replyTo: visitorEmail,
    subject: `[Permintaan Produk] ${productName} dari ${visitorName}`,
    html: htmlContent,
    attachments,
  };

  try {
    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);

    // Auto-reply ke pengunjung
    const replyOptions = {
      from: `"Toko Produk" <${process.env.EMAIL_USER}>`,
      to: visitorEmail,
      subject: `Konfirmasi: Permintaan Anda untuk ${productName} telah diterima`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Terima Kasih, ${visitorName}!</h1>
          </div>
          <div style="padding: 30px;">
            <p style="color: #555; line-height: 1.6;">Permintaan Anda untuk <strong>${productName}</strong> (${quantity} unit) telah kami terima.</p>
            <p style="color: #555; line-height: 1.6;">Tim kami akan segera menghubungi Anda dalam 1x24 jam.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>Ringkasan Permintaan:</strong></p>
              <p style="margin: 5px 0; color: #555;">Produk: ${productName}</p>
              <p style="margin: 5px 0; color: #555;">Jumlah: ${quantity} unit</p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(replyOptions);

    res.json({ success: true, message: 'Email berhasil dikirim!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim email. Periksa konfigurasi EMAIL_USER dan EMAIL_PASS di file .env' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Pastikan file .env sudah dikonfigurasi dengan EMAIL_USER dan EMAIL_PASS`);
});
