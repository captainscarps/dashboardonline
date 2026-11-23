// Supabase Edge Function: narrar
// Recebe { text } e devolve o áudio (MP3) gerado pela ElevenLabs.
// A chave fica guardada como segredo no Supabase (ELEVENLABS_API_KEY) e nunca vai para o site.
//
// Segredos (Edge Functions → Secrets):
//   ELEVENLABS_API_KEY   obrigatório — chave da ElevenLabs (começa com sk_)
//   ELEVENLABS_VOICE_ID  opcional — voz usada na narração (padrão: Adam, grave)
//   ELEVENLABS_MODEL_ID  opcional — modelo (padrão: eleven_multilingual_v2, fala português)
//   ALLOWED_ORIGINS      opcional — sites que podem usar a função, separados por vírgula
//                        ex.: https://captainscarps.github.io

const DEFAULT_VOICE = 'pNInz6obpgDQGcFmaJgB'; // Adam — voz masculina grave
const MAX_CHARS = 2500;

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const originOk = !allowed.length || allowed.includes(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(originOk ? origin : '') });
  }
  if (!originOk) return json({ error: 'Origem não permitida' }, 403, '');
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405, origin);

  const key = Deno.env.get('ELEVENLABS_API_KEY');
  if (!key) return json({ error: 'ELEVENLABS_API_KEY não configurada' }, 500, origin);

  let text = '';
  try {
    const body = await req.json();
    text = String(body?.text ?? '').trim();
  } catch {
    return json({ error: 'JSON inválido' }, 400, origin);
  }
  if (!text) return json({ error: 'Texto vazio' }, 400, origin);
  text = text.slice(0, MAX_CHARS);

  const voice = Deno.env.get('ELEVENLABS_VOICE_ID') || DEFAULT_VOICE;
  const model = Deno.env.get('ELEVENLABS_MODEL_ID') || 'eleven_multilingual_v2';

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: model,
        // Voz grave, firme e sombria: mais estável, com estilo marcado e um pouco mais lenta
        voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true, speed: 0.9 },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    return json({ error: 'Falha na ElevenLabs', status: res.status, detail: detail.slice(0, 500) }, 502, origin);
  }

  return new Response(res.body, {
    headers: { ...cors(origin), 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=31536000' },
  });
});
