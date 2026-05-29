# LucaTur — Sistema de Gestão e Rastreamento de Frota

> **Aviso:** Este repositório é uma **versão pública sanitizada**, criada exclusivamente para fins acadêmicos como projeto de Extensão Curricularizada. Nenhum dado real, credencial, token, chave de API, URL de produção ou informação operacional sensível está presente neste repositório. O sistema real de produção é privado e pertence à empresa parceira.

---

## Sobre o Projeto

O **LucaTur** é um sistema digital integrado de gestão, rastreamento e controle operacional de frota para empresas de transporte por ônibus. Foi desenvolvido como projeto de extensão curricularizada em parceria com uma empresa de transporte, com o objetivo de digitalizar e automatizar processos que anteriormente eram realizados de forma manual ou fragmentada.

A solução cobre desde o rastreamento GPS dos veículos em tempo real até o controle financeiro das operações, passando pelo cadastro e gestão de motoristas, controle de viagens, escala operacional e relatórios gerenciais.

---

## Problema Identificado

Empresas de transporte de médio porte frequentemente operam com processos parcialmente digitalizados: planilhas Excel desconectadas, comunicação por WhatsApp para operações em tempo real, ausência de rastreamento consolidado e impossibilidade de auditoria histórica das viagens. Isso gera:

- Perda de informação operacional por falta de registro centralizado
- Impossibilidade de acompanhar a localização da frota em tempo real
- Dificuldade de gestão de motoristas, escalas e ocorrências
- Relatórios financeiros imprecisos e tardios
- Decisões operacionais baseadas em dados incompletos

---

## Solução

O LucaTur propõe uma plataforma web e mobile composta por:

| Componente | Descrição |
|---|---|
| **Dashboard Administrativo** | Painel web para gestão centralizada da frota, motoristas e operações |
| **App Mobile (PWA + Android)** | Aplicativo instalável para motoristas rastrearem viagens |
| **Rastreamento GPS em Tempo Real** | Engine de localização com cálculo de distância percorrida |
| **Gestão de Motoristas** | Cadastro, escalas, notificações e histórico |
| **Controle de Viagens** | Registro, acompanhamento e finalização de corridas |
| **Módulo Financeiro** | Planilhas de custos, receitas e análises operacionais |
| **Assistente com IA** | Chat administrativo com suporte de inteligência artificial |
| **Notificações** | Sistema de alertas operacionais em tempo real |

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend Web | HTML5, CSS3, JavaScript (Vanilla) |
| App Mobile | Capacitor (Android/PWA) |
| Banco de Dados | PostgreSQL via BaaS (Backend-as-a-Service) |
| Autenticação | OAuth 2.0 (Google) |
| Mapas | MapLibre GL / Leaflet |
| Roteamento | OSRM (Open Source Routing Machine) |
| Serverless | Netlify Functions |
| Inteligência Artificial | API de Large Language Model (LLM) |
| Deploy Web | CDN/Hosting estático com CI/CD automatizado |
| Build Mobile | Gradle + GitHub Actions |

---

## Funcionalidades Principais

### Para Administradores
- Visualização em tempo real de todos os veículos no mapa
- Gerenciamento de motoristas, escalas e acessos
- Controle financeiro com planilhas integradas
- Relatórios de viagens, distâncias e ocorrências
- Assistente de IA para consultas operacionais
- Notificações e alertas de eventos

### Para Motoristas
- App mobile leve e instalável (PWA)
- Registro e encerramento de viagens
- Rastreamento GPS automático durante expediente
- Histórico de corridas e km percorridos
- Notificações sobre escala e eventos

---

## Arquitetura em Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES                                 │
│                                                             │
│   ┌──────────────────┐        ┌──────────────────────┐     │
│   │  App Mobile      │        │  Dashboard Web (Admin)│     │
│   │  (Motorista)     │        │  (Navegador)          │     │
│   │  PWA + Android   │        │                       │     │
│   └────────┬─────────┘        └──────────┬────────────┘     │
└────────────┼──────────────────────────────┼─────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND / BaaS                            │
│                                                             │
│   ┌────────────────────┐     ┌─────────────────────────┐   │
│   │  Autenticação      │     │  Serverless Functions   │   │
│   │  (OAuth 2.0)       │     │  (Netlify / Edge)       │   │
│   └────────┬───────────┘     └──────────┬──────────────┘   │
│            │                             │                  │
│            ▼                             ▼                  │
│   ┌────────────────────────────────────────────────────┐   │
│   │              Banco de Dados (PostgreSQL)            │   │
│   │  - Row Level Security (RLS) por usuário/empresa    │   │
│   │  - Realtime subscriptions                          │   │
│   │  - Storage de arquivos                             │   │
│   └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVIÇOS EXTERNOS                          │
│   Mapas (MapLibre/OSRM)  │  LLM (IA)  │  CI/CD (GitHub)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Extensão Curricularizada

Este projeto foi desenvolvido como **Projeto de Extensão Curricularizada** no curso de Análise e Desenvolvimento de Sistemas. Ele atende às seguintes temáticas de extensão:

- **Digitalização e Automação de Processos Sociais**: substituição de processos manuais por soluções digitais integradas
- **Dados, Inteligência e Tomada de Decisão**: coleta, armazenamento e análise de dados operacionais para apoio a decisões
- **Segurança, Infraestrutura e Confiabilidade**: sistema com autenticação, controle de acesso e auditoria de dados

O projeto gerou impacto direto na empresa parceira, possibilitando rastreamento em tempo real, redução de perda de informação operacional e melhoria na tomada de decisão gerencial.

---

## Como Explorar Esta Versão Demonstrativa

Este repositório não contém o sistema em produção. Ele contém:

```
src-sanitizado/     → Exemplos de código demonstrativo e sanitizado
docs/               → Documentação acadêmica e técnica
screenshots/        → (Adicione prints manualmente conforme instrução)
mockups/            → (Adicione wireframes conforme instrução)
```

Para estudar o código:

```bash
# Clone o repositório público
git clone https://github.com/SEU_USUARIO/lucatur-extension-project.git

# Explore a documentação
cd lucatur-extension-project/docs

# Leia o código de exemplo
cd lucatur-extension-project/src-sanitizado
```

> Nenhuma dependência real precisa ser instalada para estudar os exemplos demonstrativos.

---

## Impacto Observado

Ver [docs/impacto.md](docs/impacto.md) para detalhamento.

Resumo:
- Centralização do controle operacional em uma única plataforma
- Rastreamento GPS disponível para toda a frota simultaneamente
- Redução de processos manuais de registro de viagens e escalas
- Histórico auditável de todas as operações
- Dashboards em tempo real para tomada de decisão gerencial

---

## Privacidade e LGPD

Ver [docs/privacidade.md](docs/privacidade.md).

O sistema trata dados de localização, dados de trabalhadores (motoristas) e dados operacionais da empresa. Todo o tratamento segue princípios de minimização de dados, controle de acesso por função e conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).

---

## Autores

Desenvolvido como projeto de extensão curricularizada.

> Para reportar vulnerabilidades ou questões de segurança, consulte [SECURITY.md](SECURITY.md).

---

*Este é um repositório público sanitizado. A versão de produção é privada e não está disponível publicamente.*
