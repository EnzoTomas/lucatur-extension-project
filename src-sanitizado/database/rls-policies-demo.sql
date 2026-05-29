ALTER TABLE empresas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoristas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE viagens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Helpers STABLE para evitar subquery repetida em cada política
CREATE OR REPLACE FUNCTION auth_empresa_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT empresa_id FROM usuarios WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT role::TEXT FROM usuarios WHERE id = auth.uid() LIMIT 1;
$$;

-- usuarios
CREATE POLICY "usuarios_select_mesma_empresa"
ON usuarios FOR SELECT TO authenticated
USING (empresa_id = auth_empresa_id());

CREATE POLICY "usuarios_update_proprio"
ON usuarios FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "usuarios_insert_admin"
ON usuarios FOR INSERT TO authenticated
WITH CHECK (
    empresa_id = auth_empresa_id()
    AND auth_user_role() IN ('admin', 'gestor')
);

-- veiculos
CREATE POLICY "veiculos_select"
ON veiculos FOR SELECT TO authenticated
USING (empresa_id = auth_empresa_id());

CREATE POLICY "veiculos_insert"
ON veiculos FOR INSERT TO authenticated
WITH CHECK (
    empresa_id = auth_empresa_id()
    AND auth_user_role() IN ('admin', 'gestor')
);

CREATE POLICY "veiculos_update"
ON veiculos FOR UPDATE TO authenticated
USING (
    empresa_id = auth_empresa_id()
    AND auth_user_role() IN ('admin', 'gestor')
);

-- motoristas — admins veem todos, motorista vê só o próprio perfil
CREATE POLICY "motoristas_select"
ON motoristas FOR SELECT TO authenticated
USING (
    empresa_id = auth_empresa_id()
    AND (
        auth_user_role() IN ('admin', 'gestor')
        OR usuario_id = auth.uid()
    )
);

CREATE POLICY "motoristas_insert"
ON motoristas FOR INSERT TO authenticated
WITH CHECK (
    empresa_id = auth_empresa_id()
    AND auth_user_role() IN ('admin', 'gestor')
);

-- viagens
CREATE POLICY "viagens_select"
ON viagens FOR SELECT TO authenticated
USING (
    empresa_id = auth_empresa_id()
    AND (
        auth_user_role() IN ('admin', 'gestor')
        OR motorista_id IN (
            SELECT id FROM motoristas WHERE usuario_id = auth.uid()
        )
    )
);

CREATE POLICY "viagens_insert"
ON viagens FOR INSERT TO authenticated
WITH CHECK (
    empresa_id = auth_empresa_id()
    AND motorista_id IN (
        SELECT id FROM motoristas WHERE usuario_id = auth.uid()
    )
);

CREATE POLICY "viagens_update"
ON viagens FOR UPDATE TO authenticated
USING (
    empresa_id = auth_empresa_id()
    AND (
        auth_user_role() IN ('admin', 'gestor')
        OR motorista_id IN (
            SELECT id FROM motoristas WHERE usuario_id = auth.uid()
        )
    )
);

-- localizacoes
CREATE POLICY "localizacoes_select"
ON localizacoes FOR SELECT TO authenticated
USING (
    empresa_id = auth_empresa_id()
    AND (
        auth_user_role() IN ('admin', 'gestor')
        OR viagem_id IN (
            SELECT v.id FROM viagens v
            JOIN motoristas m ON m.id = v.motorista_id
            WHERE m.usuario_id = auth.uid()
        )
    )
);

-- Motorista só insere em viagens em_andamento de sua própria autoria
CREATE POLICY "localizacoes_insert"
ON localizacoes FOR INSERT TO authenticated
WITH CHECK (
    empresa_id = auth_empresa_id()
    AND viagem_id IN (
        SELECT v.id FROM viagens v
        JOIN motoristas m ON m.id = v.motorista_id
        WHERE m.usuario_id = auth.uid()
          AND v.status = 'em_andamento'
    )
);

-- notificacoes
CREATE POLICY "notificacoes_select"
ON notificacoes FOR SELECT TO authenticated
USING (
    empresa_id = auth_empresa_id()
    AND (
        auth_user_role() = 'admin'
        OR destinatario_id = auth.uid()
    )
);

CREATE POLICY "notificacoes_insert"
ON notificacoes FOR INSERT TO authenticated
WITH CHECK (
    empresa_id = auth_empresa_id()
    AND auth_user_role() = 'admin'
);

CREATE POLICY "notificacoes_marcar_lida"
ON notificacoes FOR UPDATE TO authenticated
USING (destinatario_id = auth.uid());
