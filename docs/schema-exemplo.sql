-- =============================================================
--  LucaTur — Schema de Exemplo (Demonstrativo)
--  ATENÇÃO: Este arquivo contém APENAS estrutura de exemplo
--  com nomes fictícios. Não representa o schema real de produção.
--  Não contém dados reais, credenciais ou lógica operacional.
-- =============================================================

-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABELA: usuarios_demo
-- Representa usuários do sistema (administradores e motoristas)
-- =============================================================
CREATE TABLE IF NOT EXISTS usuarios_demo (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL UNIQUE,
    nome        TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('admin', 'gestor', 'motorista')),
    empresa_id  UUID,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE usuarios_demo IS
    'Usuários do sistema com roles de acesso. Exemplo demonstrativo.';

-- =============================================================
-- TABELA: empresas_demo
-- Representa empresas operadoras (multi-tenant)
-- =============================================================
CREATE TABLE IF NOT EXISTS empresas_demo (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome        TEXT NOT NULL,
    cnpj        TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABELA: veiculos_demo
-- Representa veículos da frota
-- =============================================================
CREATE TABLE IF NOT EXISTS veiculos_demo (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id  UUID NOT NULL REFERENCES empresas_demo(id),
    placa       TEXT NOT NULL,          -- Ex: 'AAA-0000' (fictício)
    modelo      TEXT,                   -- Ex: 'Ônibus Urbano'
    ano         INTEGER,
    capacidade  INTEGER,
    status      TEXT NOT NULL DEFAULT 'disponivel'
                CHECK (status IN ('disponivel', 'em_viagem', 'manutencao', 'inativo')),
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN veiculos_demo.placa IS
    'Placa do veículo. Exemplo de formato: AAA-0000.';

-- =============================================================
-- TABELA: motoristas_demo
-- Representa motoristas vinculados a empresas
-- =============================================================
CREATE TABLE IF NOT EXISTS motoristas_demo (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id  UUID REFERENCES usuarios_demo(id),
    empresa_id  UUID NOT NULL REFERENCES empresas_demo(id),
    nome        TEXT NOT NULL,          -- Ex: 'João Silva' (fictício)
    matricula   TEXT,
    cnh         TEXT,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABELA: viagens_demo
-- Representa registros de viagens realizadas
-- =============================================================
CREATE TABLE IF NOT EXISTS viagens_demo (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id      UUID NOT NULL REFERENCES empresas_demo(id),
    motorista_id    UUID REFERENCES motoristas_demo(id),
    veiculo_id      UUID REFERENCES veiculos_demo(id),
    status          TEXT NOT NULL DEFAULT 'em_andamento'
                    CHECK (status IN ('em_andamento', 'finalizada', 'cancelada')),
    km_inicial      NUMERIC(10, 2),
    km_final        NUMERIC(10, 2),
    km_percorridos  NUMERIC(10, 2) GENERATED ALWAYS AS
                    (COALESCE(km_final, 0) - COALESCE(km_inicial, 0)) STORED,
    iniciada_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalizada_em   TIMESTAMPTZ,
    observacoes     TEXT,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABELA: localizacoes_demo
-- Representa pontos GPS coletados durante viagens
-- =============================================================
CREATE TABLE IF NOT EXISTS localizacoes_demo (
    id          BIGSERIAL PRIMARY KEY,
    viagem_id   UUID NOT NULL REFERENCES viagens_demo(id) ON DELETE CASCADE,
    latitude    NUMERIC(10, 7) NOT NULL,  -- Ex: -23.5505199 (São Paulo genérico)
    longitude   NUMERIC(10, 7) NOT NULL,  -- Ex: -46.6333094 (São Paulo genérico)
    precisao    NUMERIC(6, 2),            -- Metros de precisão GPS
    velocidade  NUMERIC(6, 2),            -- km/h estimada
    registrado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE localizacoes_demo IS
    'Histórico GPS de viagens. Coordenadas são exemplos fictícios.';

-- =============================================================
-- TABELA: eventos_demo
-- Representa ocorrências e eventos operacionais
-- =============================================================
CREATE TABLE IF NOT EXISTS eventos_demo (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id  UUID NOT NULL REFERENCES empresas_demo(id),
    viagem_id   UUID REFERENCES viagens_demo(id),
    tipo        TEXT NOT NULL,
    -- Exemplos de tipos: 'inicio_viagem', 'fim_viagem',
    --                    'parada_longa', 'ocorrencia', 'sistema'
    descricao   TEXT,
    criado_por  UUID REFERENCES usuarios_demo(id),
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- DADOS DE EXEMPLO (completamente fictícios)
-- =============================================================
INSERT INTO empresas_demo (id, nome, cnpj) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Empresa Demonstrativa LTDA', '00.000.000/0001-00');

INSERT INTO usuarios_demo (id, email, nome, role, empresa_id) VALUES
    ('00000000-0000-0000-0000-000000000010', 'admin@example.com',   'Admin Demo',  'admin',    '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000011', 'joao@example.com',    'João Silva',  'motorista','00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000012', 'maria@example.com',   'Maria Souza', 'motorista','00000000-0000-0000-0000-000000000001');

INSERT INTO veiculos_demo (id, empresa_id, placa, modelo, ano, capacidade) VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'AAA-0000', 'Ônibus Urbano',   2018, 45),
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'BBB-1111', 'Micro-ônibus',    2020, 25),
    ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'CCC-2222', 'Van Executiva',   2022, 15);

INSERT INTO motoristas_demo (id, empresa_id, nome, matricula) VALUES
    ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'João Silva',   'MAT-001'),
    ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Maria Souza',  'MAT-002');

-- =============================================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_viagens_empresa
    ON viagens_demo(empresa_id);

CREATE INDEX IF NOT EXISTS idx_viagens_motorista
    ON viagens_demo(motorista_id);

CREATE INDEX IF NOT EXISTS idx_viagens_status
    ON viagens_demo(status);

CREATE INDEX IF NOT EXISTS idx_localizacoes_viagem
    ON localizacoes_demo(viagem_id);

CREATE INDEX IF NOT EXISTS idx_localizacoes_tempo
    ON localizacoes_demo(registrado_em DESC);

-- =============================================================
-- FIM DO SCHEMA DE EXEMPLO
-- Este arquivo é demonstrativo. O schema de produção é privado.
-- =============================================================
