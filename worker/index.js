const ALLOWED = ['https://shreenandbhattad.github.io', 'http://localhost:8000', 'http://localhost:8123'];
const MAX_CHARS = 320;

function cors(origin) {
  return {
    'access-control-allow-origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'origin'
  };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('origin') || '';
    const headers = cors(origin);

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return new Response('Not found', { status: 404, headers });
    if (!ALLOWED.includes(origin)) return new Response('Forbidden', { status: 403, headers });

    let text = '';
    try { text = String((await req.json()).text || '').trim(); } catch (e) {}
    if (!text) return new Response('Empty', { status: 400, headers });
    text = text.slice(0, MAX_CHARS);

    const voice = env.VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
    const upstream = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/' + voice + '?output_format=mp3_44100_64',
      {
        method: 'POST',
        headers: { 'xi-api-key': env.ELEVEN_API_KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 1.0 }
        })
      }
    );

    if (!upstream.ok) return new Response('Voice unavailable', { status: 502, headers });
    return new Response(upstream.body, {
      headers: { ...headers, 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=86400' }
    });
  }
};
