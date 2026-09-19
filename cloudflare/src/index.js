const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });
const uuid = () => crypto.randomUUID();
function cors(env) { return { 'access-control-allow-origin': env.ALLOWED_ORIGIN, 'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS', 'access-control-allow-headers': 'content-type,x-admin-token' }; }
function safeName(name) { return String(name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 100); }
function isAdmin(request, env) { return request.headers.get('x-admin-token') === env.ADMIN_TOKEN; }
async function adminGuard(request, env) { return isAdmin(request, env) ? null : json({ error: 'Unauthorized' }, 401, cors(env)); }
async function supabase(env, path, init = {}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json', ...(init.headers || {}) } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url); const headers = cors(env);
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (url.pathname === '/health') return json({ ok: true }, 200, headers);

    if (request.method === 'GET' && url.pathname === '/api/photos') {
      const rows = await env.DB.prepare("select id, guest_name, caption, created_at from photos where status = 'approved' order by created_at desc").all();
      return json(rows.results.map(row => ({ ...row, url: `${url.origin}/media/${row.id}` })), 200, headers);
    }
    if (request.method === 'POST' && url.pathname === '/api/uploads') {
      const form = await request.formData(); const file = form.get('photo'); const guest = String(form.get('guest_name') || '').trim(); const caption = String(form.get('caption') || '').trim();
      if (!(file instanceof File) || !guest || guest.length > 60 || !file.type.startsWith('image/') || file.size > 15 * 1024 * 1024) return json({ error: 'Ảnh không hợp lệ (tối đa 15 MB).' }, 400, headers);
      const id = uuid(); const objectKey = `pending/${id}-${safeName(file.name)}`;
      await env.PHOTOS.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { guest } });
      await env.DB.prepare('insert into photos (id,object_key,guest_name,caption,content_type) values (?,?,?,?,?)').bind(id, objectKey, guest, caption.slice(0, 280), file.type).run();
      return json({ ok: true, message: 'Đã gửi ảnh, chờ Nam & Hằng duyệt.' }, 201, headers);
    }
    if (request.method === 'GET' && url.pathname.startsWith('/media/')) {
      const id = url.pathname.slice('/media/'.length); const row = await env.DB.prepare("select object_key, content_type from photos where id = ? and status = 'approved'").bind(id).first();
      if (!row) return new Response('Not found', { status: 404 });
      const object = await env.PHOTOS.get(row.object_key); if (!object) return new Response('Not found', { status: 404 });
      return new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || row.content_type, 'cache-control': 'public, max-age=86400' } });
    }

    if (url.pathname.startsWith('/api/admin/')) {
      const denied = await adminGuard(request, env); if (denied) return denied;
      if (request.method === 'GET' && url.pathname === '/api/admin/photos') {
        const rows = await env.DB.prepare('select id, guest_name, caption, status, created_at from photos order by created_at desc').all();
        return json(rows.results.map(row => ({ ...row, preview: `${url.origin}/api/admin/photo/${row.id}` })), 200, headers);
      }
      if (request.method === 'GET' && url.pathname.startsWith('/api/admin/photo/')) {
        const id = url.pathname.slice('/api/admin/photo/'.length); const row = await env.DB.prepare('select object_key, content_type from photos where id=?').bind(id).first(); const object = row && await env.PHOTOS.get(row.object_key);
        return object ? new Response(object.body, { headers: { 'content-type': object.httpMetadata?.contentType || row.content_type } }) : new Response('Not found', { status: 404 });
      }
      if (request.method === 'PATCH' && url.pathname.startsWith('/api/admin/photos/')) {
        const id = url.pathname.slice('/api/admin/photos/'.length); const { status } = await request.json(); if (!['approved','hidden'].includes(status)) return json({ error: 'Bad status' }, 400, headers);
        await env.DB.prepare('update photos set status=? where id=?').bind(status, id).run(); return json({ ok: true }, 200, headers);
      }
      if (request.method === 'GET' && url.pathname === '/api/admin/wishes') {
        const response = await supabase(env, 'wishes?select=id,guest_name,message,status,created_at&order=created_at.desc'); return new Response(response.body, { status: response.status, headers });
      }
      if (request.method === 'PATCH' && url.pathname.startsWith('/api/admin/wishes/')) {
        const id = url.pathname.slice('/api/admin/wishes/'.length); const { status } = await request.json(); if (!['approved','hidden'].includes(status)) return json({ error: 'Bad status' }, 400, headers);
        const response = await supabase(env, `wishes?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }) }); return json({ ok: response.ok }, response.ok ? 200 : response.status, headers);
      }
    }
    return json({ error: 'Not found' }, 404, headers);
  }
};
