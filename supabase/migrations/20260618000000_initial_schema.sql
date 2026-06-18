-- ============================================================
-- MOBI CRM — Migración inicial
-- ============================================================


-- -------------------------------------------------------
-- ENUMS
-- -------------------------------------------------------

CREATE TYPE rol_membresia AS ENUM ('admin', 'miembro');
CREATE TYPE estado_membresia AS ENUM ('pendiente', 'activa');
CREATE TYPE rol_persona_alquiler AS ENUM ('locador', 'locatario');
CREATE TYPE estado_alquiler AS ENUM ('activo', 'vencido', 'rescindido');
CREATE TYPE indice_actualizacion AS ENUM ('IPC', 'ICL', 'otro');
CREATE TYPE tipo_inmueble AS ENUM ('casa', 'departamento', 'local', 'otro');
CREATE TYPE tipo_publicacion AS ENUM ('alquiler', 'venta');
CREATE TYPE estado_publicacion AS ENUM ('activo', 'pausado', 'archivado');
CREATE TYPE plataforma_publicacion AS ENUM ('web_propia', 'zonaprop', 'mercadolibre', 'argenprop');
CREATE TYPE estado_plataforma AS ENUM ('pendiente', 'publicado', 'pausado', 'error');


-- -------------------------------------------------------
-- FUNCIÓN: set_updated_at
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;


-- -------------------------------------------------------
-- TABLA: usuarios
-- -------------------------------------------------------

CREATE TABLE usuarios (
  id             uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre         varchar     NOT NULL,
  apellido       varchar     NOT NULL,
  email          varchar     NOT NULL UNIQUE,
  avatar_url     text,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  borrado_en     timestamptz DEFAULT NULL
);

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Crea el perfil público automáticamente al registrarse en auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, apellido, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_select_own"
  ON usuarios FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "usuarios_update_own"
  ON usuarios FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- -------------------------------------------------------
-- TABLA: inmobiliarias
-- RLS se agrega más abajo, después de crear membresias
-- -------------------------------------------------------

CREATE TABLE inmobiliarias (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         varchar     NOT NULL,
  email          varchar,
  telefono       varchar,
  direccion      text,
  ciudad         varchar,
  plan           varchar     NOT NULL DEFAULT 'free',
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  creado_por     uuid        REFERENCES usuarios(id),
  borrado_en     timestamptz DEFAULT NULL
);

CREATE TRIGGER trg_inmobiliarias_updated_at
  BEFORE UPDATE ON inmobiliarias
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE inmobiliarias ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------
-- TABLA: membresias
-- Debe existir antes de las funciones auxiliares
-- -------------------------------------------------------

CREATE TABLE membresias (
  id              uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      uuid             REFERENCES usuarios(id),
  inmobiliaria_id uuid             NOT NULL REFERENCES inmobiliarias(id),
  email_invitado  varchar          NOT NULL,
  nombre_invitado varchar          NOT NULL,
  rol             rol_membresia    NOT NULL DEFAULT 'miembro',
  estado          estado_membresia NOT NULL DEFAULT 'pendiente',
  creado_en       timestamptz      NOT NULL DEFAULT now(),
  actualizado_en  timestamptz      NOT NULL DEFAULT now(),
  creado_por      uuid             NOT NULL REFERENCES usuarios(id),
  borrado_en      timestamptz      DEFAULT NULL,
  CONSTRAINT uq_usuario_inmobiliaria UNIQUE (usuario_id, inmobiliaria_id)
);

CREATE TRIGGER trg_membresias_updated_at
  BEFORE UPDATE ON membresias
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE membresias ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------
-- FUNCIONES AUXILIARES (SECURITY DEFINER — bypass RLS)
-- Deben ir después de que exista la tabla membresias
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION get_inmobiliaria_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
SET search_path = public
STABLE AS $$
  SELECT inmobiliaria_id
  FROM membresias
  WHERE usuario_id = auth.uid()
    AND estado = 'activa'
    AND borrado_en IS NULL
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION es_admin(p_inmobiliaria_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
SET search_path = public
STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM membresias
    WHERE usuario_id = auth.uid()
      AND inmobiliaria_id = COALESCE(p_inmobiliaria_id, get_inmobiliaria_id())
      AND rol = 'admin'
      AND estado = 'activa'
      AND borrado_en IS NULL
  );
$$;


-- -------------------------------------------------------
-- RLS: inmobiliarias
-- -------------------------------------------------------

CREATE POLICY "inmobiliarias_select"
  ON inmobiliarias FOR SELECT
  USING (id = get_inmobiliaria_id() AND borrado_en IS NULL);

CREATE POLICY "inmobiliarias_insert"
  ON inmobiliarias FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND creado_por = auth.uid());

CREATE POLICY "inmobiliarias_update"
  ON inmobiliarias FOR UPDATE
  USING (id = get_inmobiliaria_id() AND es_admin() AND borrado_en IS NULL)
  WITH CHECK (id = get_inmobiliaria_id());


-- Trigger: crea la membresía admin del fundador al crear una inmobiliaria
CREATE OR REPLACE FUNCTION crear_membresia_fundador()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO membresias (
    usuario_id, inmobiliaria_id, email_invitado,
    nombre_invitado, rol, estado, creado_por
  )
  SELECT
    NEW.creado_por,
    NEW.id,
    u.email,
    u.nombre || ' ' || u.apellido,
    'admin',
    'activa',
    NEW.creado_por
  FROM usuarios u
  WHERE u.id = NEW.creado_por;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inmobiliaria_crear_fundador
  AFTER INSERT ON inmobiliarias
  FOR EACH ROW EXECUTE FUNCTION crear_membresia_fundador();


-- -------------------------------------------------------
-- RLS: membresias
-- -------------------------------------------------------

CREATE POLICY "membresias_select"
  ON membresias FOR SELECT
  USING (
    borrado_en IS NULL
    AND (
      usuario_id = auth.uid()
      OR inmobiliaria_id = get_inmobiliaria_id()
    )
  );

CREATE POLICY "membresias_insert"
  ON membresias FOR INSERT
  WITH CHECK (
    inmobiliaria_id = get_inmobiliaria_id()
    AND es_admin()
  );

CREATE POLICY "membresias_update"
  ON membresias FOR UPDATE
  USING (inmobiliaria_id = get_inmobiliaria_id() AND es_admin() AND borrado_en IS NULL)
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id());


-- -------------------------------------------------------
-- TABLA: permisos_secciones
-- Debe existir antes del trigger trg_membresia_crear_permisos
-- -------------------------------------------------------

CREATE TABLE permisos_secciones (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  membresia_id        uuid        NOT NULL UNIQUE REFERENCES membresias(id) ON DELETE CASCADE,
  calculadora_tasas   boolean     NOT NULL DEFAULT false,
  calculadora_ipc_icl boolean     NOT NULL DEFAULT false,
  alquileres          boolean     NOT NULL DEFAULT false,
  sitio_web           boolean     NOT NULL DEFAULT false,
  publicaciones       boolean     NOT NULL DEFAULT false,
  documentos          boolean     NOT NULL DEFAULT false,
  creado_en           timestamptz NOT NULL DEFAULT now(),
  actualizado_en      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_permisos_secciones_updated_at
  BEFORE UPDATE ON permisos_secciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE permisos_secciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permisos_secciones_select"
  ON permisos_secciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membresias m
      WHERE m.id = permisos_secciones.membresia_id
        AND m.inmobiliaria_id = get_inmobiliaria_id()
        AND m.borrado_en IS NULL
    )
  );

CREATE POLICY "permisos_secciones_update"
  ON permisos_secciones FOR UPDATE
  USING (
    es_admin()
    AND EXISTS (
      SELECT 1 FROM membresias m
      WHERE m.id = permisos_secciones.membresia_id
        AND m.inmobiliaria_id = get_inmobiliaria_id()
        AND m.borrado_en IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membresias m
      WHERE m.id = permisos_secciones.membresia_id
        AND m.inmobiliaria_id = get_inmobiliaria_id()
    )
  );


-- Trigger: crea los permisos (todos en false) al crear una membresía
CREATE OR REPLACE FUNCTION crear_permisos_secciones()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO permisos_secciones (membresia_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_membresia_crear_permisos
  AFTER INSERT ON membresias
  FOR EACH ROW EXECUTE FUNCTION crear_permisos_secciones();


-- -------------------------------------------------------
-- TABLA: personas
-- -------------------------------------------------------

CREATE TABLE personas (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inmobiliaria_id uuid        NOT NULL REFERENCES inmobiliarias(id),
  nombre          varchar     NOT NULL,
  apellido        varchar     NOT NULL,
  dni             varchar,
  email           varchar,
  telefono        varchar,
  direccion       text,
  ciudad          varchar,
  notas           text,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en  timestamptz NOT NULL DEFAULT now(),
  creado_por      uuid        REFERENCES usuarios(id),
  borrado_en      timestamptz DEFAULT NULL
);

CREATE TRIGGER trg_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personas_all"
  ON personas FOR ALL
  USING (inmobiliaria_id = get_inmobiliaria_id() AND borrado_en IS NULL)
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id());


-- -------------------------------------------------------
-- TABLA: alquileres
-- -------------------------------------------------------

CREATE TABLE alquileres (
  id                   uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  inmobiliaria_id      uuid                 NOT NULL REFERENCES inmobiliarias(id),
  fecha_inicio         date                 NOT NULL,
  fecha_fin            date                 NOT NULL,
  monto_inicial        numeric(12,2)        NOT NULL,
  indice_actualizacion indice_actualizacion NOT NULL,
  periodicidad_aumento varchar              NOT NULL,
  estado               estado_alquiler      NOT NULL DEFAULT 'activo',
  direccion            text                 NOT NULL,
  ciudad               varchar              NOT NULL,
  tipo_inmueble        tipo_inmueble        NOT NULL,
  superficie           numeric(8,2),
  departamento         varchar,
  piso                 varchar,
  torre                varchar,
  creado_en            timestamptz          NOT NULL DEFAULT now(),
  actualizado_en       timestamptz          NOT NULL DEFAULT now(),
  creado_por           uuid                 REFERENCES usuarios(id),
  borrado_en           timestamptz          DEFAULT NULL
);

CREATE TRIGGER trg_alquileres_updated_at
  BEFORE UPDATE ON alquileres
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE alquileres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alquileres_all"
  ON alquileres FOR ALL
  USING (inmobiliaria_id = get_inmobiliaria_id() AND borrado_en IS NULL)
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id());


-- -------------------------------------------------------
-- TABLA: personas_alquileres
-- -------------------------------------------------------

CREATE TABLE personas_alquileres (
  id          uuid                 PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id  uuid                 NOT NULL REFERENCES personas(id),
  alquiler_id uuid                 NOT NULL REFERENCES alquileres(id),
  rol         rol_persona_alquiler NOT NULL,
  creado_en   timestamptz          NOT NULL DEFAULT now(),
  CONSTRAINT uq_persona_alquiler_rol UNIQUE (persona_id, alquiler_id, rol)
);

ALTER TABLE personas_alquileres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personas_alquileres_all"
  ON personas_alquileres FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM alquileres a
      WHERE a.id = personas_alquileres.alquiler_id
        AND a.inmobiliaria_id = get_inmobiliaria_id()
        AND a.borrado_en IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alquileres a
      WHERE a.id = personas_alquileres.alquiler_id
        AND a.inmobiliaria_id = get_inmobiliaria_id()
        AND a.borrado_en IS NULL
    )
  );


-- -------------------------------------------------------
-- TABLA: documentos
-- -------------------------------------------------------

CREATE TABLE documentos (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  alquiler_id    uuid        NOT NULL REFERENCES alquileres(id),
  nombre         varchar     NOT NULL,
  tipo           varchar,
  storage_path   text        NOT NULL,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  creado_por     uuid        REFERENCES usuarios(id),
  borrado_en     timestamptz DEFAULT NULL
);

CREATE TRIGGER trg_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_all"
  ON documentos FOR ALL
  USING (
    borrado_en IS NULL
    AND EXISTS (
      SELECT 1 FROM alquileres a
      WHERE a.id = documentos.alquiler_id
        AND a.inmobiliaria_id = get_inmobiliaria_id()
        AND a.borrado_en IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alquileres a
      WHERE a.id = documentos.alquiler_id
        AND a.inmobiliaria_id = get_inmobiliaria_id()
        AND a.borrado_en IS NULL
    )
  );


-- -------------------------------------------------------
-- TABLA: webs
-- -------------------------------------------------------

CREATE TABLE webs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inmobiliaria_id uuid        NOT NULL REFERENCES inmobiliarias(id),
  nombre          varchar     NOT NULL,
  slug            varchar     NOT NULL,
  whatsapp        varchar     NOT NULL,
  logo_path       text,
  portada_path    text,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en  timestamptz NOT NULL DEFAULT now(),
  creado_por      uuid        REFERENCES usuarios(id),
  borrado_en      timestamptz DEFAULT NULL,
  CONSTRAINT uq_web_inmobiliaria UNIQUE (inmobiliaria_id),
  CONSTRAINT uq_web_slug UNIQUE (slug),
  CONSTRAINT slug_formato CHECK (slug ~ '^[a-z0-9][a-z0-9-]*$')
);

CREATE TRIGGER trg_webs_updated_at
  BEFORE UPDATE ON webs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE webs ENABLE ROW LEVEL SECURITY;

-- Lectura pública para el catálogo www.mobi.com/[slug]
CREATE POLICY "webs_select_public"
  ON webs FOR SELECT
  USING (borrado_en IS NULL);

CREATE POLICY "webs_insert"
  ON webs FOR INSERT
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id() AND es_admin());

CREATE POLICY "webs_update"
  ON webs FOR UPDATE
  USING (inmobiliaria_id = get_inmobiliaria_id() AND es_admin() AND borrado_en IS NULL)
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id());

CREATE POLICY "webs_delete"
  ON webs FOR DELETE
  USING (inmobiliaria_id = get_inmobiliaria_id() AND es_admin());


-- -------------------------------------------------------
-- TABLA: publicaciones
-- -------------------------------------------------------

CREATE TABLE publicaciones (
  id              uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  inmobiliaria_id uuid               NOT NULL REFERENCES inmobiliarias(id),
  titulo          varchar            NOT NULL,
  descripcion     text,
  tipo            tipo_publicacion   NOT NULL,
  estado          estado_publicacion NOT NULL DEFAULT 'activo',
  precio          numeric(12,2),
  moneda          varchar            NOT NULL DEFAULT 'ARS',
  direccion       text               NOT NULL,
  ciudad          varchar            NOT NULL,
  tipo_inmueble   tipo_inmueble      NOT NULL,
  superficie      numeric(8,2),
  ambientes       integer,
  departamento    varchar,
  piso            varchar,
  torre           varchar,
  creado_en       timestamptz        NOT NULL DEFAULT now(),
  actualizado_en  timestamptz        NOT NULL DEFAULT now(),
  creado_por      uuid               REFERENCES usuarios(id),
  borrado_en      timestamptz        DEFAULT NULL
);

CREATE TRIGGER trg_publicaciones_updated_at
  BEFORE UPDATE ON publicaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;

-- Lectura pública de publicaciones activas para el catálogo web
CREATE POLICY "publicaciones_select_public"
  ON publicaciones FOR SELECT
  USING (estado = 'activo' AND borrado_en IS NULL);

CREATE POLICY "publicaciones_select_own"
  ON publicaciones FOR SELECT
  USING (inmobiliaria_id = get_inmobiliaria_id() AND borrado_en IS NULL);

CREATE POLICY "publicaciones_insert"
  ON publicaciones FOR INSERT
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id());

CREATE POLICY "publicaciones_update"
  ON publicaciones FOR UPDATE
  USING (inmobiliaria_id = get_inmobiliaria_id() AND borrado_en IS NULL)
  WITH CHECK (inmobiliaria_id = get_inmobiliaria_id());


-- -------------------------------------------------------
-- TABLA: publicaciones_plataformas
-- -------------------------------------------------------

CREATE TABLE publicaciones_plataformas (
  id             uuid                   PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id uuid                   NOT NULL REFERENCES publicaciones(id),
  plataforma     plataforma_publicacion NOT NULL,
  estado         estado_plataforma      NOT NULL DEFAULT 'pendiente',
  id_externo     varchar,
  publicado_en   timestamptz,
  creado_en      timestamptz            NOT NULL DEFAULT now(),
  actualizado_en timestamptz            NOT NULL DEFAULT now(),
  CONSTRAINT uq_publicacion_plataforma UNIQUE (publicacion_id, plataforma)
);

CREATE TRIGGER trg_publicaciones_plataformas_updated_at
  BEFORE UPDATE ON publicaciones_plataformas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE publicaciones_plataformas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publicaciones_plataformas_all"
  ON publicaciones_plataformas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM publicaciones p
      WHERE p.id = publicaciones_plataformas.publicacion_id
        AND p.inmobiliaria_id = get_inmobiliaria_id()
        AND p.borrado_en IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM publicaciones p
      WHERE p.id = publicaciones_plataformas.publicacion_id
        AND p.inmobiliaria_id = get_inmobiliaria_id()
        AND p.borrado_en IS NULL
    )
  );
