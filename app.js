const photos = [
  ['https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80','ceremony','Khoảnh khắc trước lễ cưới'],
  ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80','ceremony','Lời hẹn ước'],
  ['https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1000&q=80','friends','Nụ cười của bạn bè'],
  ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1100&q=80','party','Bữa tiệc dưới đèn'],
  ['https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&q=80','friends','Những người thân yêu'],
  ['https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1400&q=80','party','Điệu nhảy đầu tiên'],
  ['https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1100&q=80','ceremony','Hoa và nắng'],
  ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1100&q=80','friends','Một ngày hạnh phúc']
];
const gallery = document.querySelector('#gallery'); const lightbox = document.querySelector('#lightbox');
function render(filter='all'){gallery.innerHTML=''; photos.filter(p=>filter==='all'||p[1]===filter).forEach(([src,tag,caption])=>{const f=document.createElement('figure');f.className='photo';f.innerHTML=`<img loading="lazy" src="${src}" alt="${caption}">`;f.onclick=()=>{lightbox.querySelector('img').src=src;lightbox.querySelector('p').textContent=caption;lightbox.showModal()};gallery.appendChild(f)})};render();
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{document.querySelector('.filters .active').classList.remove('active');button.classList.add('active');render(button.dataset.filter)});
lightbox.querySelector('.close').onclick=()=>lightbox.close();lightbox.onclick=e=>{if(e.target===lightbox) lightbox.close()};
document.querySelector('#shareButton').onclick=async()=>{try{await navigator.clipboard.writeText(location.href)}catch{}const toast=document.querySelector('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)};
document.querySelector('#fileInput').onchange=e=>{const n=e.target.files.length;if(n) alert(`Đã chọn ${n} hình. Khi kết nối Supabase, ảnh sẽ được tải lên và chờ duyệt.`)};
