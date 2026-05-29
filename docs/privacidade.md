# Privacidade e Proteção de Dados — LucaTur

> Documento acadêmico sobre práticas de privacidade adotadas no projeto.
> Este documento descreve abordagens e boas práticas — não contém dados reais de usuários.

---

## 1. Introdução

O LucaTur é um sistema que trata dados de trabalhadores (motoristas), dados de localização geográfica e dados operacionais de uma empresa de transporte. Por isso, está sujeito às disposições da **Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)** e às boas práticas de segurança da informação.

Este documento descreve quais tipos de dados são tratados, como são protegidos e quais mecanismos de controle foram implementados.

---

## 2. Categorias de Dados Tratados

### 2.1 Dados de Motoristas (Titulares — trabalhadores)

| Dado | Finalidade | Base Legal (LGPD) |
|---|---|---|
| Nome completo | Identificação no sistema | Execução de contrato (Art. 7º, V) |
| E-mail | Autenticação e comunicação | Execução de contrato (Art. 7º, V) |
| Matrícula | Controle de acesso e escala | Execução de contrato (Art. 7º, V) |
| Foto (opcional) | Identificação no painel | Consentimento (Art. 7º, I) |

### 2.2 Dados de Localização GPS

| Dado | Finalidade | Observação |
|---|---|---|
| Coordenadas GPS (lat/lng) | Rastreamento de viagem | Coletado apenas durante expediente ativo |
| Timestamp | Histórico de posições | Vinculado à viagem, não ao dispositivo |
| Velocidade estimada | Diagnóstico de rota | Derivado das coordenadas |

> **Importante:** O rastreamento GPS é ativado pelo motorista ao iniciar uma viagem e encerrado ao finalizar. Não há coleta contínua de localização fora do expediente.

### 2.3 Dados Operacionais

| Dado | Finalidade |
|---|---|
| Registros de viagens | Controle operacional e histórico |
| Km percorridos | Cálculo de custo e desempenho |
| Eventos/ocorrências | Auditoria e segurança operacional |
| Dados financeiros | Controle de custos e receitas |

---

## 3. Princípios LGPD Aplicados

### 3.1 Finalidade
Os dados são coletados com finalidades específicas, explícitas e informadas aos titulares. Não são utilizados para finalidades incompatíveis com as declaradas.

### 3.2 Adequação
Apenas os dados necessários para cada finalidade são coletados. Por exemplo, localização GPS é coletada apenas durante viagens ativas.

### 3.3 Necessidade (Minimização de Dados)
O princípio da minimização é aplicado em cada módulo:
- Dados de motoristas: apenas dados profissionais mínimos
- GPS: coordenadas sem dados de sensor adicional (sem câmera, sem microfone)
- Financeiro: dados da operação, não dados pessoais de clientes/passageiros

### 3.4 Livre Acesso
Os titulares (motoristas) têm acesso ao seu próprio histórico de viagens e dados registrados no sistema.

### 3.5 Segurança
Mecanismos de segurança implementados:
- Autenticação via OAuth 2.0 (sem senhas armazenadas no sistema)
- Autorização por função (role-based access control)
- Isolamento de dados por empresa (Row Level Security)
- Transmissão exclusivamente via HTTPS

---

## 4. Controle de Acesso

O sistema implementa controle de acesso baseado em função (RBAC):

| Role | Acesso |
|---|---|
| `admin` | Acesso completo a todos os dados da empresa |
| `gestor` | Acesso a relatórios e visão gerencial, sem configurações |
| `motorista` | Acesso apenas aos próprios dados e viagens |

A segregação é reforçada no banco de dados via Row Level Security (RLS), garantindo que mesmo uma sessão comprometida não consiga acessar dados de outra empresa ou de outro usuário.

---

## 5. Dados de Localização — Cuidados Específicos

Dados de localização GPS são especialmente sensíveis pois podem revelar padrões de comportamento, residência e rotina de trabalhadores. O sistema adota:

- **Coleta consentida**: motoristas são informados e habilitam o rastreamento ativamente
- **Escopo limitado**: localização coletada apenas durante viagem ativa
- **Retenção limitada**: dados históricos de localização devem ter prazo de retenção definido pela empresa
- **Acesso restrito**: apenas admins e gestores da mesma empresa acessam dados de localização
- **Sem compartilhamento com terceiros**: dados GPS não são enviados a nenhum serviço externo além do banco de dados da aplicação

---

## 6. Segurança de Infraestrutura

### Banco de Dados
- PostgreSQL gerenciado em ambiente cloud com backups automáticos
- Row Level Security habilitado em todas as tabelas com dados sensíveis
- Conexões criptografadas (TLS obrigatório)
- Credenciais de acesso gerenciadas por variáveis de ambiente, nunca no código

### Autenticação
- OAuth 2.0 via Google: o sistema nunca armazena senhas
- Tokens JWT com expiração e renovação automática
- Nenhuma sessão persiste indefinidamente

### Funções Serverless
- Credenciais de API gerenciadas exclusivamente por variáveis de ambiente do provedor
- Sem armazenamento de dados sensíveis em logs de função
- Timeouts configurados para evitar abuso

---

## 7. Direitos dos Titulares

Em conformidade com a LGPD (Art. 18), os titulares têm direito a:

| Direito | Como é atendido |
|---|---|
| Acesso | O motorista pode visualizar seus próprios dados no app |
| Correção | Dados podem ser atualizados pelo administrador ou pelo próprio usuário |
| Exclusão | Mediante solicitação, dados pessoais podem ser removidos |
| Portabilidade | Registros de viagens podem ser exportados |
| Informação | Este documento e os termos de uso informam o tratamento |

---

## 8. Separação: Ambiente Demonstrativo vs. Produção

| Aspecto | Ambiente de Demonstração (este repositório) | Ambiente de Produção |
|---|---|---|
| Dados | Completamente fictícios | Dados reais da empresa |
| Credenciais | Placeholders (`process.env.*`) | Variáveis de ambiente no provedor |
| Banco de dados | Não conectado | Instância real e privada |
| GPS | Coordenadas de exemplo | GPS real dos dispositivos |
| Usuários | Nomes fictícios (`João Silva`) | Motoristas reais |
| Acesso | Público (sem autenticação) | Restrito por OAuth |

---

## 9. Encarregado de Dados (DPO)

Para questões relacionadas à privacidade de dados no ambiente de produção, o contato deve ser feito diretamente com a empresa parceira, responsável pelo tratamento dos dados reais.

---

*Este documento é de uso acadêmico. Nenhum dado real de usuários está presente neste repositório.*
