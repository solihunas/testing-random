let capturedScreenshot = null;

// ── Screenshot ──
document.getElementById('screenshotBtn').addEventListener('click', async () => {
  const btn = document.getElementById('screenshotBtn');
  btn.disabled = true;
  btn.textContent = 'Mengambil...';

  try {
    const target = document.body;
    const canvas = await html2canvas(target, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f0f2f5',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    capturedScreenshot = dataUrl;

    document.getElementById('screenshotPreview').src = dataUrl;
    document.getElementById('downloadLink').href = dataUrl;
    document.getElementById('screenshotModal').classList.remove('hidden');
  } catch (err) {
    showToast('Gagal mengambil screenshot: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      Ambil Screenshot`;
  }
});

// ── Modal Close ──
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('screenshotModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('screenshotModal')) closeModal();
});

function closeModal() {
  document.getElementById('screenshotModal').classList.add('hidden');
}

// ── Form Submit ──
document.getElementById('inquiryForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;

  showLoading('Mengirim permintaan...');

  const formData = {
    visitorName: document.getElementById('visitorName').value.trim(),
    visitorEmail: document.getElementById('visitorEmail').value.trim(),
    visitorPhone: document.getElementById('visitorPhone').value.trim(),
    productName: document.getElementById('productName').value,
    quantity: document.getElementById('quantity').value,
    message: document.getElementById('message').value.trim(),
    timestamp: new Date().toISOString(),
    screenshot: capturedScreenshot || '',
  };

  try {
    const res = await fetch('/api/send-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      showToast('Permintaan berhasil dikirim! Cek email Anda untuk konfirmasi.', 'success');
      e.target.reset();
      capturedScreenshot = null;
    } else {
      showToast(data.message || 'Terjadi kesalahan, coba lagi.', 'error');
    }
  } catch (err) {
    showToast('Gagal terhubung ke server. Pastikan server berjalan.', 'error');
  } finally {
    hideLoading();
    submitBtn.disabled = false;
  }
});

// ── Helpers ──
function showLoading(text = 'Memproses...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const msgEl = document.querySelector('.toast-message');

  toast.className = `toast ${type}`;
  msgEl.textContent = message;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}
