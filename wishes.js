/* Add your Supabase project URL and publishable (anon) key in supabase-config.js.
   Never put a service_role key in this file or in GitHub. */
const config = window.WEDDING_CONFIG || {};
const wishForm = document.querySelector('#wishForm');
const wishStatus = document.querySelector('#wishStatus');
const wishTrack = document.querySelector('#wishTrack');
let wishes = [];

function escapeHtml(value) {
  const node = document.createElement('span');
  node.textContent = value;
  return node.innerHTML;
}

function renderWishes() {
  if (!wishes.length) {
    wishTrack.innerHTML = '<span class="wish-item"><b>Nam & Hằng</b>Cảm ơn bạn đã gửi lời chúc đầu tiên cho chúng mình.</span>';
    return;
  }
  const content = wishes.map(({ guest_name, message }) =>
    `<span class="wish-item"><b>${escapeHtml(guest_name)}</b>${escapeHtml(message)}</span><span class="wish-dot">✦</span>`
  ).join('');
  // Duplicate the content so the marquee loops continuously.
  wishTrack.innerHTML = content + content;
}

function setStatus(text, isError = false) {
  wishStatus.textContent = text;
  wishStatus.style.color = isError ? '#ffb4a6' : '';
}

async function startWishes() {
  if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
    setStatus('Chế độ xem trước — kết nối Supabase để lưu lời chúc.', false);
    renderWishes();
    return;
  }
  const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  const { data, error } = await client.from('wishes').select('id, guest_name, message, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(30);
  if (error) setStatus('Không thể tải lời chúc. Vui lòng thử lại.', true);
  wishes = data || [];
  renderWishes();
  client.channel('wedding-wishes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' }, ({ new: row }) => {
      if (row.status === 'approved') { wishes.unshift(row); wishes = wishes.slice(0, 30); renderWishes(); }
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wishes' }, ({ new: row }) => {
      const index = wishes.findIndex(item => item.id === row.id);
      if (row.status === 'approved' && index < 0) wishes.unshift(row);
      if (row.status !== 'approved' && index >= 0) wishes.splice(index, 1);
      renderWishes();
    }).subscribe();
  wishForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(wishForm);
    const guest_name = String(form.get('guest_name') || '').trim();
    const message = String(form.get('message') || '').trim();
    if (guest_name.length < 2 || message.length < 2) { setStatus('Vui lòng nhập tên và lời chúc.', true); return; }
    const button = wishForm.querySelector('button'); button.disabled = true; setStatus('Đang gửi lời chúc...');
    const { error: insertError } = await client.from('wishes').insert({ guest_name, message });
    button.disabled = false;
    if (insertError) { setStatus('Gửi chưa thành công. Vui lòng thử lại.', true); return; }
    wishForm.reset(); setStatus('Cảm ơn bạn! Lời chúc đang chờ Nam & Hằng duyệt.');
  });
}
startWishes();
