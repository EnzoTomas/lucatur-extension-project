# src-sanitizado — Código Demonstrativo

> **AVISO IMPORTANTE:** Os arquivos nesta pasta são **versões demonstrativas e acadêmicas** criadas exclusivamente para ilustrar os conceitos e abordagens técnicas do projeto LucaTur.
>
> Eles **não representam o código real de produção**. Credenciais, URLs, dados de usuários, lógica operacional sensível e algoritmos críticos foram removidos ou substituídos por exemplos genéricos e fictícios.

---

## Estrutura

```
src-sanitizado/
├── config/
│   └── env.example.js          → Template de variáveis de ambiente
├── frontend/
│   ├── gps-tracker-demo.js     → Demonstração de rastreamento GPS
│   ├── auth-demo.js            → Fluxo de autenticação OAuth
│   └── dashboard-demo.js       → Estrutura do dashboard administrativo
├── backend/
│   ├── check-update-demo.js    → Verificação de atualização do app
│   └── gemini-admin-demo.js    → Integração com IA generativa
├── database/
│   ├── schema-demo.sql         → Schema de banco de dados de exemplo
│   └── rls-policies-demo.sql   → Políticas de segurança de exemplo
└── mobile/
    ├── capacitor.config.example.json  → Configuração do Capacitor
    └── build.gradle.example           → Configuração de build Android
```

---

## Como Usar

Estes arquivos são para **leitura e estudo**. Para executar qualquer parte:

1. Copie `config/env.example.js` para `config/env.js`
2. Preencha com suas próprias credenciais de um projeto de desenvolvimento
3. Nunca commite o arquivo `env.js` preenchido

---

## O Que Cada Arquivo Demonstra

| Arquivo | Conceito Demonstrado |
|---|---|
| `env.example.js` | Padrão de separação de configuração do código |
| `gps-tracker-demo.js` | Geolocation API, cálculo de distância (Haversine), IndexedDB offline |
| `auth-demo.js` | OAuth 2.0 com Supabase, gestão de sessão JWT |
| `dashboard-demo.js` | Realtime subscriptions, renderização de mapa, módulos de UI |
| `check-update-demo.js` | Netlify Function para verificação de versão de app |
| `gemini-admin-demo.js` | Integração de LLM via API em serverless function |
| `schema-demo.sql` | Modelagem relacional para frota e rastreamento |
| `rls-policies-demo.sql` | Row Level Security multi-tenant no PostgreSQL |
| `capacitor.config.example.json` | Configuração de app mobile com Capacitor |
| `build.gradle.example` | Build Android sem credenciais hardcoded |

---

*Todo o código nesta pasta é fictício e demonstrativo. Não está conectado a nenhum sistema real.*
