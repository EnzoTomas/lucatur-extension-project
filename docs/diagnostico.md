# Diagnóstico: Problema Identificado e Justificativa do Projeto

> Documento acadêmico de extensão curricularizada — LucaTur

---

## 1. Contexto Organizacional

A empresa parceira atua no segmento de transporte rodoviário de passageiros, operando uma frota de veículos para rotas urbanas e regionais. Como acontece com muitas empresas de médio porte do setor, a gestão operacional era realizada com uma combinação de ferramentas não integradas: planilhas eletrônicas, comunicação informal por aplicativos de mensagens e processos de registro majoritariamente manuais.

Esse cenário, comum em empresas que cresceram organicamente antes da era dos sistemas integrados, gerava uma série de problemas recorrentes que impactavam a eficiência operacional, a rastreabilidade das informações e a capacidade de tomada de decisão em tempo hábil.

---

## 2. Problemas Identificados

### 2.1 Ausência de Rastreamento em Tempo Real

Antes da implantação do sistema, não havia forma de saber a posição de cada veículo durante as operações. A localização era comunicada informalmente — por ligação ou mensagem — quando havia necessidade. Isso tornava impossível:

- Monitorar a pontualidade das rotas
- Identificar desvios ou paradas não planejadas
- Acionar suporte imediato em situações de emergência
- Auditar historicamente os percursos realizados

### 2.2 Registro Manual e Fragmentado de Viagens

O controle de viagens era feito em planilhas preenchidas manualmente, frequentemente com atraso ou de forma incompleta. Problemas decorrentes:

- Dados inconsistentes entre planilhas de diferentes setores
- Impossibilidade de cruzar informações de viagem com custos e receitas
- Ausência de histórico confiável de km percorridos por veículo
- Dificuldade de auditar registros de motoristas

### 2.3 Gestão de Motoristas Descentralizada

Escalas, folgas, designações e ocorrências com motoristas eram gerenciadas por comunicação direta sem sistema de registro. Consequências:

- Conflitos de escala difíceis de rastrear
- Ausência de notificações formais de escala para motoristas
- Sem histórico de desempenho ou ocorrências por motorista
- Dificuldade de gestão de acessos ao sistema

### 2.4 Controle Financeiro Impreciso

Os custos operacionais (combustível, pedágios, manutenção) e receitas eram registrados separadamente, sem vinculação às viagens correspondentes. Isso gerava:

- Relatórios financeiros tardios e imprecisos
- Impossibilidade de calcular custo por km ou por viagem em tempo real
- Dificuldade de identificar rotas ou veículos com desempenho abaixo do esperado

### 2.5 Tomada de Decisão Sem Dados em Tempo Real

Os gestores não tinham visibilidade imediata do estado da frota. Qualquer decisão operacional dependia de consultas manuais a múltiplas pessoas e fontes, consumindo tempo e aumentando o risco de erro.

---

## 3. Justificativa do Projeto

A digitalização e integração de processos operacionais no transporte de passageiros representa uma necessidade urgente para empresas que desejam manter competitividade e compliance regulatório. Além do ganho operacional, a coleta de dados estruturados abre caminho para decisões baseadas em evidências, redução de custos e melhoria na qualidade do serviço ao usuário final.

O LucaTur foi concebido como resposta direta a esses problemas, com foco em:

- **Baixo custo de implantação**: uso de BaaS e hospedagem estática reduz custo de infraestrutura
- **Adoção simplificada**: interface web e app instalável sem exigir novo hardware
- **Integração progressiva**: módulos independentes que podem ser adotados gradualmente
- **Escalabilidade**: arquitetura cloud-native preparada para crescimento da frota

---

## 4. Temáticas de Extensão

O projeto se enquadra nas seguintes temáticas da extensão curricularizada:

### Digitalização e Automação de Processos Sociais
A substituição de processos manuais por uma plataforma digital integrada impacta diretamente as condições de trabalho dos motoristas, reduzindo ambiguidades, melhorando comunicação e formalizando registros que antes eram informais.

### Dados, Inteligência e Tomada de Decisão
A coleta estruturada de dados operacionais (localização, viagens, custos) cria uma base de conhecimento que antes não existia. O módulo de IA agrega uma camada de consulta em linguagem natural sobre esses dados, democratizando o acesso à inteligência operacional para gestores com diferentes níveis de habilidade técnica.

### Segurança, Infraestrutura e Confiabilidade
O projeto introduz controles de autenticação, controle de acesso por função, isolamento de dados por empresa e auditoria de ações — transformando um ambiente de gestão informal em um sistema com trilha de auditoria e segurança de dados.

---

## 5. Delimitação do MVP (Produto Mínimo Viável)

Para a primeira entrega, o MVP foi definido com os seguintes módulos essenciais:

| Módulo | Status no MVP |
|---|---|
| Autenticação (login Google) | Incluído |
| Mapa com localização em tempo real | Incluído |
| Cadastro de motoristas | Incluído |
| Registro e finalização de viagens | Incluído |
| App mobile para motoristas (PWA) | Incluído |
| Rastreamento GPS automático | Incluído |
| Notificações de escala | Incluído |
| Módulo financeiro completo | Entregue em versão subsequente |
| Assistente de IA | Entregue em versão subsequente |
| Build Android nativo (APK) | Entregue em versão subsequente |

---

## 6. Metodologia de Desenvolvimento

O desenvolvimento seguiu princípios de desenvolvimento ágil informal, com:

- **Ciclos curtos de entrega**: funcionalidades priorizadas por impacto operacional
- **Feedback contínuo**: validação direta com usuários reais da empresa parceira
- **Implantação incremental**: cada módulo foi colocado em produção assim que estável
- **Testes em ambiente real**: uso real da plataforma revelou requisitos não mapeados inicialmente

---

*Este documento é de uso acadêmico. Nenhum dado real da empresa parceira está presente.*
