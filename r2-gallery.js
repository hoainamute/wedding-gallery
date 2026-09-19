// Replaces the demo upload interaction when Cloudflare Worker configuration exists.
const r2Config = window.CLOUDFLARE_CONFIG;
if (r2Config?.apiUrl) {
  const r2Input = document.querySelector('#fileInput');
  r2Input.onchange = async (event) => {
    const files = [...event.target.files]; if (!files.length) return;
    const guestName = window.prompt('Tên của bạn (để Nam & Hằng biết ai gửi ảnh):');
    if (!guestName?.trim()) { r2Input.value = ''; return; }
    const uploadToast = document.querySelector('#toast'); uploadToast.textContent = 'Đang gửi ảnh...'; uploadToast.classList.add('show');
    try {
      for (const photo of files) { const body = new FormData(); body.append('photo', photo); body.append('guest_name', guestName.trim()); await fetch(`${r2Config.apiUrl}/api/uploads`, { method: 'POST', body }).then(r => { if (!r.ok) throw new Error(); }); }
      uploadToast.textContent = 'Đã gửi ảnh, chờ Nam & Hằng duyệt.';
    } catch { uploadToast.textContent = 'Gửi ảnh chưa thành công. Vui lòng thử lại.'; }
    setTimeout(() => uploadToast.classList.remove('show'), 3200); r2Input.value = '';
  };
}
