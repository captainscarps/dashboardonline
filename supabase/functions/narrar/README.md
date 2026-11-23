# Função `narrar` (narração das missões com ElevenLabs)

O site chama esta função, e só ela fala com a ElevenLabs. A chave nunca fica no código.

## Publicar pelo painel do Supabase
1. **Edge Functions → Secrets**: crie `ELEVENLABS_API_KEY` com a chave da ElevenLabs (começa com `sk_`).
   Opcional: `ELEVENLABS_VOICE_ID` (outra voz), `ALLOWED_ORIGINS` (ex.: `https://captainscarps.github.io`).
2. **Edge Functions → Deploy a new function → Via Editor**: nome `narrar`, cole o conteúdo de `index.ts` e publique.
3. Abra o detalhe de uma missão no site e toque em **Narrar missão**.

## Publicar pela linha de comando (alternativa)
```bash
supabase link --project-ref zlsnqewkhaaubqbbbclf
supabase secrets set ELEVENLABS_API_KEY=sk_...
supabase functions deploy narrar
```

Cada narração gerada fica guardada no aparelho, então tocar de novo não gasta créditos.
