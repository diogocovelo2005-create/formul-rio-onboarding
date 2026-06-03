# Formulário de Onboarding

Formulário multi-step para onboarding de negócios. Submete diretamente para a tabela `businesses` no Supabase.

## Setup local

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local com a tua service role key do Supabase
npm run dev
```

## Deploy na Vercel

1. Faz push para o GitHub
2. Importa o projeto na Vercel
3. Adiciona as variáveis de ambiente:
   - `SUPABASE_URL` = `https://tashltifayouuogizezd.supabase.co`
   - `SUPABASE_SERVICE_KEY` = a tua service role key
4. Deploy!

## Estrutura

```
src/
├── app/
│   ├── layout.tsx          # Layout com fontes
│   ├── page.tsx            # Página do formulário
│   ├── globals.css         # Tailwind + tema
│   └── api/submit/route.ts # API que insere no Supabase
└── components/
    └── onboarding-form.tsx # Formulário multi-step
```

## Mapeamento Form → BD

| Campo do form | Coluna na BD | Notas |
|---|---|---|
| nome | nome | direto |
| morada | morada | direto |
| maps_link | maps_link | direto |
| horarios | horarios | direto |
| booking_link | booking_link | direto |
| owner_whatsapp | owner_whatsapp | direto |
| profissionais | staff | JSONB array de nomes |
| servicos + packs | servicos | JSONB array de objetos |
| missed_call_msg | missed_call_message | só se preenchido |
| tudo o resto | system_prompt_extras | texto formatado |
