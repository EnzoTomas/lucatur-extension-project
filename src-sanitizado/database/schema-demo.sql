CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE status_veiculo AS ENUM ('disponivel', 'em_viagem', 'manutencao', 'inativo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE role_usuario AS ENUM ('admin', 'gestor', 'motorista');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE status_viagem AS ENUM ('pendente', 'em_andamento', 'finalizada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tenant raiz — todos os dados são isolados por empresa
CREATE TABLE IF NOT EXISTS empresas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    ativo       BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- id espelha o uuid do Supabase Auth para facilitar auth.uid() no RLS
CREATE TABLE IF NOT EXISTS usuarios (
    id            UUID PRIMARY KEY,
    empresa_id    UUID NOT NULL REFERENCES empresas(id),
    email         TEXT NOT NULL,
    nome          TEXT NOT NULL,
    role          role_usuario NOT NULL DEFAULT 'motorista',
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veiculos (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id    UUID NOT NULL REFERENCES empresas(id),
    placa         TEXT NOT NULL,
    modelo        TEXT,
    fabricante    TEXT,
    ano           SMALLINT,
    capacidade    SMALLINT,
    status        status_veiculo NOT NULL DEFAULT 'disponivel',
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(empresa_id, placa)
);

CREATE TABLE IF NOT EXISTS motoristas (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    empresa_id     UUID NOT NULL REFERENCES empresas(id),
    nome           TEXT NOT NULL,
    matricula      TEXT,
    cnh_numero     TEXT,
    cnh_vencimento DATE,
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(empresa_id, matricula)
);

CREATE TABLE IF NOT EXISTS viagens (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id    UUID NOT NULL REFERENCES empresas(id),
    motorista_id  UUID REFERENCES motoristas(id),
    veiculo_id    UUID REFERENCES veiculos(id),
    status        status_viagem NOT NULL DEFAULT 'pendente',
    km_inicial    NUMERIC(10, 2),
    km_final      NUMERIC(10, 2),
    iniciada_em   TIMESTAMPTZ,
    finalizada_em TIMESTAMPTZ,
    observacoes   TEXT,
    criado_por    UUID REFERENCES usuarios(id),
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE viagens
    ADD COLUMN IF NOT EXISTS km_percorridos NUMERIC
    GENERATED ALWAYS AS (
        CASE WHEN km_final IS NOT NULL AND km_inicial IS NOT NULL
        THEN km_final - km_inicial ELSE NULL END
    ) STORED;

-- empresa_id desnormalizado aqui porque localizacoes tem taxa de insert muito alta
-- e a subquery via viagens seria cara no RLS
CREATE TABLE IF NOT EXISTS localizacoes (
    id             BIGSERIAL,
    viagem_id      UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
    empresa_id     UUID NOT NULL,
    latitude       NUMERIC(10, 7) NOT NULL,
    longitude      NUMERIC(10, 7) NOT NULL,
    precisao_m     NUMERIC(6, 2),
    velocidade_kmh NUMERIC(5, 1),
    altitude_m     NUMERIC(7, 1),
    registrado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, registrado_em)
) PARTITION BY RANGE (registrado_em);

CREATE TABLE IF NOT EXISTS localizacoes_default
    PARTITION OF localizacoes DEFAULT;

CREATE TABLE IF NOT EXISTS notificacoes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id),
    destinatario_id UUID REFERENCES usuarios(id),
    titulo          TEXT NOT NULL,
    mensagem        TEXT NOT NULL,
    tipo            TEXT NOT NULL DEFAULT 'info', -- 'info' | 'escala' | 'alerta' | 'sistema'
    lida            BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_viagens_empresa_status
    ON viagens(empresa_id, status);

CREATE INDEX IF NOT EXISTS idx_viagens_motorista
    ON viagens(motorista_id) WHERE status = 'em_andamento';

CREATE INDEX IF NOT EXISTS idx_localizacoes_viagem_tempo
    ON localizacoes(viagem_id, registrado_em DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_nao_lida
    ON notificacoes(destinatario_id) WHERE lida = FALSE;

CREATE INDEX IF NOT EXISTS idx_veiculos_empresa_status
    ON veiculos(empresa_id, status);

-- Trigger para manter atualizado_em
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_veiculos_updated_at
    BEFORE UPDATE ON veiculos FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_viagens_updated_at
    BEFORE UPDATE ON viagens FOR EACH ROW EXECUTE FUNCTION set_updated_at();
