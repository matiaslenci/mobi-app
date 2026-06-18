# DATABASE.md — MOBI CRM Inmobiliario

> Documento de referencia para la base de datos del proyecto. Incluye lógica de negocio, reglas de integridad y el esquema completo en DBML.
> Leelo antes de generar migraciones SQL o modificar la estructura.

---

## 1. Lógica de negocio

### Multi-tenancy
- La unidad de aislamiento es la **inmobiliaria**. Todo dato pertenece a una inmobiliaria.
- Ninguna inmobiliaria puede ver ni acceder a datos de otra.
- El aislamiento se garantiza con **Row Level Security (RLS)** en Supabase filtrando por `inmobiliaria_id`.

### Usuarios y membresías
- Un usuario puede existir sin inmobiliaria (ej: viene de la calculadora gratuita y aún no hizo upgrade).
- Un usuario solo puede pertenecer a **una inmobiliaria a la vez**.
- Una inmobiliaria puede tener **muchos usuarios**.
- Puede haber **más de un admin** por inmobiliaria.
- Los roles posibles de membresía son: `admin` y `miembro`.
- El estado de una membresía puede ser: `pendiente` (invitación enviada, usuario no registrado aún) o `activa`.
- El flujo de invitación es: el admin carga nombre + email del nuevo usuario → el sistema crea la membresía en estado `pendiente` con los permisos asignados → Supabase envía el email de invitación → el usuario elige contraseña y completa su perfil → la membresía pasa a `activa`.

### Permisos por sección
- Los permisos se asignan en el momento de la invitación y pueden editarse después.
- El acceso a una sección es **todo o nada** (booleano): si tiene acceso puede realizar todas las operaciones de esa sección.
- Las 6 secciones con control de acceso son: `calculadora_tasas`, `calculadora_ipc_icl`, `alquileres`, `sitio_web`, `publicaciones`, `documentos`.

### Personas
- Una persona (locador o locatario) pertenece a una inmobiliaria y solo esa inmobiliaria puede verla.
- Una persona puede participar en **muchos alquileres** con distintos roles.
- El rol de una persona en un alquiler puede ser `locador` o `locatario`.
- Un alquiler puede tener **múltiples locadores y/o múltiples locatarios** (ej: inmueble con dos dueños, o dos inquilinos que comparten).

### Alquileres
- Un alquiler pertenece a una inmobiliaria.
- Los datos del inmueble viven **dentro del alquiler** (no es una entidad separada).
- Un alquiler puede tener **uno o muchos documentos**.
- Los documentos no se comparten entre alquileres.
- Los archivos físicos de los documentos se almacenan en **Supabase Storage**; en la tabla solo se guarda el path/URL.
- El estado de un alquiler puede ser: `activo`, `vencido` o `rescindido`.
- El índice de actualización puede ser: `IPC`, `ICL` u `otro`.

### Publicaciones
- Una publicación pertenece a una inmobiliaria.
- Las publicaciones son **completamente independientes** de los alquileres (no hay vínculo entre tablas).
- El tipo de publicación puede ser: `alquiler` o `venta`.
- El estado general de una publicación puede ser: `activo`, `pausado` o `archivado`.
- Una publicación puede publicarse en múltiples plataformas: `web_propia`, `zonaprop`, `mercadolibre`, `argenprop`.
- Cada plataforma tiene su **propio estado independiente**: `pendiente`, `publicado`, `pausado` o `error`.
- Se guarda el `id_externo` que devuelve cada plataforma para poder gestionar la publicación desde su API.

### Web (catálogo público)
- Cada inmobiliaria puede tener **una sola web** pública en `www.mobi.com/[slug]`.
- La web tiene perfil de la inmobiliaria: logo, foto de portada, nombre, slug de URL y WhatsApp de contacto.
- Las imágenes (logo y portada) se almacenan en **Supabase Storage**.

### Borrado lógico y auditoría
- Todas las tablas tienen borrado lógico mediante el campo `borrado_en` (null = registro activo).
- Todas las tablas tienen campos de auditoría: `creado_en`, `actualizado_en` y `creado_por`.

---

## 2. Esquema DBML

```dbml
// -------------------------------------------------------
// MOBI CRM — Esquema de base de datos
// Versión: 1.0
// -------------------------------------------------------

// -------------------------------------------------------
// ENUMS
// -------------------------------------------------------

enum rol_membresia {
  admin
  miembro
}

enum estado_membresia {
  pendiente
  activa
}

enum rol_persona_alquiler {
  locador
  locatario
}

enum estado_alquiler {
  activo
  vencido
  rescindido
}

enum indice_actualizacion {
  IPC
  ICL
  otro
}

enum tipo_inmueble {
  casa
  departamento
  local
  otro
}

enum tipo_publicacion {
  alquiler
  venta
}

enum estado_publicacion {
  activo
  pausado
  archivado
}

enum plataforma_publicacion {
  web_propia
  zonaprop
  mercadolibre
  argenprop
}

enum estado_plataforma {
  pendiente
  publicado
  pausado
  error
}

// -------------------------------------------------------
// USUARIOS
// Extiende auth.users de Supabase.
// Un usuario puede existir sin inmobiliaria.
// -------------------------------------------------------

Table usuarios {
  id            uuid        [pk, note: 'Referencia a auth.users de Supabase']
  nombre        varchar     [not null]
  apellido      varchar     [not null]
  email         varchar     [not null, unique]
  avatar_url    text        [note: 'Path en Supabase Storage']
  creado_en     timestamptz [not null, default: `now()`]
  actualizado_en timestamptz [not null, default: `now()`]
  borrado_en    timestamptz [default: null, note: 'Borrado lógico. Null = activo']
}

// -------------------------------------------------------
// INMOBILIARIAS
// La unidad de aislamiento (tenant).
// -------------------------------------------------------

Table inmobiliarias {
  id            uuid        [pk, default: `gen_random_uuid()`]
  nombre        varchar     [not null]
  email         varchar
  telefono      varchar
  direccion     text
  ciudad        varchar
  plan          varchar     [not null, default: 'free', note: 'free | mobi']
  creado_en     timestamptz [not null, default: `now()`]
  actualizado_en timestamptz [not null, default: `now()`]
  creado_por    uuid        [ref: > usuarios.id]
  borrado_en    timestamptz [default: null, note: 'Borrado lógico. Null = activo']
}

// -------------------------------------------------------
// MEMBRESÍAS
// Relación usuario <-> inmobiliaria.
// Un usuario solo puede tener una membresía activa.
// -------------------------------------------------------

Table membresias {
  id              uuid             [pk, default: `gen_random_uuid()`]
  usuario_id      uuid             [ref: > usuarios.id, note: 'Null si la invitación aún no fue aceptada']
  inmobiliaria_id uuid             [not null, ref: > inmobiliarias.id]
  email_invitado  varchar          [not null, note: 'Email al que se envió la invitación']
  nombre_invitado varchar          [not null, note: 'Nombre cargado por el admin al invitar']
  rol             rol_membresia    [not null, default: 'miembro']
  estado          estado_membresia [not null, default: 'pendiente']
  creado_en       timestamptz      [not null, default: `now()`]
  actualizado_en  timestamptz      [not null, default: `now()`]
  creado_por      uuid             [not null, ref: > usuarios.id, note: 'Admin que creó la invitación']
  borrado_en      timestamptz      [default: null, note: 'Borrado lógico. Null = activo']

  indexes {
    (usuario_id, inmobiliaria_id) [unique, name: 'uq_usuario_inmobiliaria']
  }
}

// -------------------------------------------------------
// PERMISOS POR SECCIÓN
// Una fila por sección, ligada a la membresía.
// Booleano: true = acceso total, false = sin acceso.
// -------------------------------------------------------

Table permisos_secciones {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  membresia_id        uuid        [not null, ref: > membresias.id]
  calculadora_tasas   boolean     [not null, default: false]
  calculadora_ipc_icl boolean     [not null, default: false]
  alquileres          boolean     [not null, default: false]
  sitio_web           boolean     [not null, default: false]
  publicaciones       boolean     [not null, default: false]
  documentos          boolean     [not null, default: false]
  creado_en           timestamptz [not null, default: `now()`]
  actualizado_en      timestamptz [not null, default: `now()`]

  indexes {
    membresia_id [unique, name: 'uq_permisos_membresia']
  }
}

// -------------------------------------------------------
// PERSONAS
// Locadores y locatarios. Pertenecen a una inmobiliaria.
// Una persona puede participar en muchos alquileres.
// -------------------------------------------------------

Table personas {
  id              uuid        [pk, default: `gen_random_uuid()`]
  inmobiliaria_id uuid        [not null, ref: > inmobiliarias.id]
  nombre          varchar     [not null]
  apellido        varchar     [not null]
  dni             varchar
  email           varchar
  telefono        varchar     [note: 'Teléfono o WhatsApp']
  direccion       text
  ciudad          varchar
  notas           text        [note: 'Campo libre para observaciones']
  creado_en       timestamptz [not null, default: `now()`]
  actualizado_en  timestamptz [not null, default: `now()`]
  creado_por      uuid        [ref: > usuarios.id]
  borrado_en      timestamptz [default: null, note: 'Borrado lógico. Null = activo']
}

// -------------------------------------------------------
// ALQUILERES
// Los datos del inmueble viven dentro del alquiler.
// -------------------------------------------------------

Table alquileres {
  id                   uuid                [pk, default: `gen_random_uuid()`]
  inmobiliaria_id      uuid                [not null, ref: > inmobiliarias.id]

  // Datos del contrato
  fecha_inicio         date                [not null]
  fecha_fin            date                [not null]
  monto_inicial        numeric(12,2)       [not null]
  indice_actualizacion indice_actualizacion [not null]
  periodicidad_aumento varchar             [not null, note: 'Ej: mensual, trimestral, semestral']
  estado               estado_alquiler     [not null, default: 'activo']

  // Datos del inmueble
  direccion            text                [not null]
  ciudad               varchar             [not null]
  tipo_inmueble        tipo_inmueble       [not null]
  superficie           numeric(8,2)        [note: 'm²']
  departamento         varchar             [note: 'Opcional. Ej: Palermo, Recoleta']
  piso                 varchar             [note: 'Opcional']
  torre                varchar             [note: 'Opcional']

  // Auditoría
  creado_en            timestamptz         [not null, default: `now()`]
  actualizado_en       timestamptz         [not null, default: `now()`]
  creado_por           uuid                [ref: > usuarios.id]
  borrado_en           timestamptz         [default: null, note: 'Borrado lógico. Null = activo']
}

// -------------------------------------------------------
// PERSONAS_ALQUILERES
// Tabla puente entre personas y alquileres.
// Una persona puede ser locador en un contrato
// y locatario en otro.
// -------------------------------------------------------

Table personas_alquileres {
  id          uuid                  [pk, default: `gen_random_uuid()`]
  persona_id  uuid                  [not null, ref: > personas.id]
  alquiler_id uuid                  [not null, ref: > alquileres.id]
  rol         rol_persona_alquiler  [not null]
  creado_en   timestamptz           [not null, default: `now()`]

  indexes {
    (persona_id, alquiler_id, rol) [unique, name: 'uq_persona_alquiler_rol']
  }
}

// -------------------------------------------------------
// DOCUMENTOS
// Archivos ligados a un alquiler.
// El archivo físico vive en Supabase Storage.
// No se comparten entre alquileres.
// -------------------------------------------------------

Table documentos {
  id              uuid        [pk, default: `gen_random_uuid()`]
  alquiler_id     uuid        [not null, ref: > alquileres.id]
  nombre          varchar     [not null]
  tipo            varchar     [note: 'Ej: DNI, contrato, recibo, garantía']
  storage_path    text        [not null, note: 'Path en Supabase Storage']
  creado_en       timestamptz [not null, default: `now()`]
  actualizado_en  timestamptz [not null, default: `now()`]
  creado_por      uuid        [ref: > usuarios.id]
  borrado_en      timestamptz [default: null, note: 'Borrado lógico. Null = activo']
}

// -------------------------------------------------------
// WEBS
// Perfil público de la inmobiliaria.
// Una inmobiliaria tiene una sola web.
// URL pública: www.mobi.com/[slug]
// -------------------------------------------------------

Table webs {
  id              uuid        [pk, default: `gen_random_uuid()`]
  inmobiliaria_id uuid        [not null, ref: > inmobiliarias.id]
  nombre          varchar     [not null]
  slug            varchar     [not null, unique, note: 'URL pública: mobi.com/[slug]']
  whatsapp        varchar     [not null, note: 'Número con código de país. Ej: 5491112345678']
  logo_path       text        [note: 'Path en Supabase Storage']
  portada_path    text        [note: 'Path en Supabase Storage']
  creado_en       timestamptz [not null, default: `now()`]
  actualizado_en  timestamptz [not null, default: `now()`]
  creado_por      uuid        [ref: > usuarios.id]
  borrado_en      timestamptz [default: null, note: 'Borrado lógico. Null = activo']

  indexes {
    inmobiliaria_id [unique, name: 'uq_web_inmobiliaria']
    slug            [unique, name: 'uq_web_slug']
  }
}

// -------------------------------------------------------
// PUBLICACIONES
// Catálogo de propiedades en alquiler o venta.
// Independientes de la tabla alquileres.
// -------------------------------------------------------

Table publicaciones {
  id              uuid               [pk, default: `gen_random_uuid()`]
  inmobiliaria_id uuid               [not null, ref: > inmobiliarias.id]

  // Datos de la publicación
  titulo          varchar            [not null]
  descripcion     text
  tipo            tipo_publicacion   [not null]
  estado          estado_publicacion [not null, default: 'activo']
  precio          numeric(12,2)
  moneda          varchar            [not null, default: 'ARS', note: 'ARS | USD']

  // Datos del inmueble
  direccion       text               [not null]
  ciudad          varchar            [not null]
  tipo_inmueble   tipo_inmueble      [not null]
  superficie      numeric(8,2)       [note: 'm²']
  ambientes       integer
  departamento    varchar            [note: 'Opcional']
  piso            varchar            [note: 'Opcional']
  torre           varchar            [note: 'Opcional']

  // Auditoría
  creado_en       timestamptz        [not null, default: `now()`]
  actualizado_en  timestamptz        [not null, default: `now()`]
  creado_por      uuid               [ref: > usuarios.id]
  borrado_en      timestamptz        [default: null, note: 'Borrado lógico. Null = activo']
}

// -------------------------------------------------------
// PUBLICACIONES_PLATAFORMAS
// Estado de cada publicación en cada plataforma.
// Una publicación puede estar en múltiples plataformas
// con estado independiente en cada una.
// -------------------------------------------------------

Table publicaciones_plataformas {
  id              uuid                  [pk, default: `gen_random_uuid()`]
  publicacion_id  uuid                  [not null, ref: > publicaciones.id]
  plataforma      plataforma_publicacion [not null]
  estado          estado_plataforma     [not null, default: 'pendiente']
  id_externo      varchar               [note: 'ID devuelto por la API de la plataforma externa']
  publicado_en    timestamptz
  creado_en       timestamptz           [not null, default: `now()`]
  actualizado_en  timestamptz           [not null, default: `now()`]

  indexes {
    (publicacion_id, plataforma) [unique, name: 'uq_publicacion_plataforma']
  }
}
```

---

## 3. Resumen de relaciones

| Tabla origen | Relación | Tabla destino |
|---|---|---|
| `inmobiliarias` | 1 → N | `membresias` |
| `inmobiliarias` | 1 → N | `personas` |
| `inmobiliarias` | 1 → N | `alquileres` |
| `inmobiliarias` | 1 → N | `publicaciones` |
| `inmobiliarias` | 1 → 1 | `webs` |
| `usuarios` | 1 → N | `membresias` |
| `membresias` | 1 → 1 | `permisos_secciones` |
| `alquileres` | 1 → N | `documentos` |
| `alquileres` | N → N | `personas` (vía `personas_alquileres`) |
| `publicaciones` | 1 → N | `publicaciones_plataformas` |

---

## 4. Notas para la generación de SQL

- `usuarios.id` referencia a `auth.users.id` de Supabase — no se crea con `gen_random_uuid()`, lo provee el sistema de auth.
- Todas las tablas necesitan políticas **RLS** filtrando por `inmobiliaria_id` para garantizar el aislamiento entre agencias.
- Los campos `borrado_en` deben incluirse en todas las queries como filtro `WHERE borrado_en IS NULL`.
- El campo `slug` de `webs` debe validarse como URL-safe (solo letras minúsculas, números y guiones).
- `permisos_secciones` se crea automáticamente al crear una membresía, con todos los permisos en `false` por defecto.
- Los admins tienen acceso a todas las secciones independientemente de `permisos_secciones` — esto se maneja a nivel de RLS y lógica de aplicación.
