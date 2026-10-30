exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  const endpoint = process.env.APPS_SCRIPT_URL;
  if (!endpoint) return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'APPS_SCRIPT_URL belum diatur di Netlify.' }) };
  try {
    const payload = JSON.parse(event.body || '{}');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { ok: response.ok, message: text.slice(0, 300) }; }
    return { statusCode: response.ok && data.ok !== false ? 200 : 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: false, error: String(e.message || e) }) };
  }
};
