# AGENT.md — MOBI CRM Inmobiliario

> Documento de contexto para agentes de IA y desarrolladores que trabajen en este proyecto.
> Leelo completo antes de generar o modificar código. Si una decisión no está acá, preguntá antes de inventar.
> Documentos relacionados: `DESIGN.md` (sistema de diseño), `DATABASE.md` (esquema de base de datos y lógica de negocio).

---

## 1. Qué es este proyecto

**MOBI** es un CRM web para inmobiliarias del mercado argentino. Es un sistema **multiusuario y multi-inmobiliaria**: cada agencia se registra de forma independiente, tiene sus propios usuarios y sus propios datos, totalmente aislados de las demás agencias.

### Estrategia de producto
Existe una app gratuita externa (**Calculadora de tasas**) que actúa como gancho de adquisición. Los usuarios que se registran ahí pueden hacer upgrade a MOBI (app de paga). Ambas apps comparten el **mismo proyecto de Supabase** (misma base de datos y auth), lo que permite una conversión sin fricción: el usuario ya está registrado y no necesita crear una cuenta nueva.

```
Calculadora (app gratuita)  ─┐
                              ├──→ Supabase Project (misma DB, mismo Auth)
MOBI CRM (app de paga)      ─┘
```

El campo `plan` en la tabla `inmobiliarias` controla el acceso: `free` para la calculadora, `mobi` para el CRM completo.

### Flujo de registro
Un usuario puede existir sin inmobiliaria (viene de la calculadora). Cuando hace upgrade a MOBI, crea su inmobiliaria y se convierte en su primer admin. A partir de ahí puede invitar a otros usuarios y delegar acceso por sección.

**Estado actual del desarrollo:** planificación y base de datos. El frontend aún no está implementado.

---

## 2. Stack tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | **React 18** | Componentes funcionales + hooks, nada de class components |
| Build / dev | **Vite** | SPA, no SSR |
| Lenguaje | **TypeScript** | Confirmado |
| Estilos | **Tailwind CSS** | Utilidades; evitar CSS suelto salvo casos puntuales |
| Componentes UI | **shadcn/ui** | Se copian a `src/components/ui/`. No reescribir a mano: usar el CLI de shadcn |
| Routing | **React Router v6+** | Rutas protegidas por autenticación y por permiso de sección |
| Estado servidor | **TanStack Query** | Cache y fetching de datos de Supabase |
| Estado cliente | **Zustand** | Sesión/usuario actual y UI global |
| Formularios | **react-hook-form + zod** | Encaja con shadcn (`Form`); validación con esquemas zod |
| Iconos | **lucide-react** | Ya viene con shadcn |
| Backend / Auth | **Supabase** | Auth + Postgres con RLS + Storage. **Confirmado** |
| Lógica custom | **Supabase Edge Functions** | Para consultas a APIs externas (INDEC, portales) |

**Convención clave:** todo acceso a Supabase pasa por una capa en `src/lib/supabase.ts`. Ningún componente llama a Supabase directo; usan hooks de `src/features/*/api`.

---

## 3. Backend: Supabase

### Por qué Supabase (confirmado)
- Datos relacionales complejos → Postgres nativo
- Multi-tenancy con aislamiento garantizado → Row Level Security (RLS)
- Archivos de documentos → Supabase Storage
- Auth con invitaciones por email → auth.users + magic links
- Open source, sin lock-in, auto-hosteable

### Arquitectura
No hay backend intermedio (no NestJS, no Express). El front se conecta directo a Supabase para auth, CRUD y storage. La única excepción son las **Edge Functions** para:
- Consultas a la API del INDEC (IPC/ICL)
- Integraciones con portales (Zonaprop, MercadoLibre, Argenprop) — pendiente de implementación

### Multi-tenancy y RLS
- Todas las tablas tienen `inmobiliaria_id`.
- Las políticas RLS filtran por `inmobiliaria_id` del usuario autenticado.
- **El aislamiento no se delega al front** — la base de datos lo garantiza.
- Los registros eliminados usan **borrado lógico** (`borrado_en timestamptz`, null = activo). Todas las queries deben incluir `WHERE borrado_en IS NULL`.

### Tier gratuito
El proyecto arranca en el tier gratuito de Supabase (1 GB Storage, 500 MB DB, 50K MAUs). Limitación importante: los proyectos sin actividad por 7 días se pausan automáticamente. Configurar un **cron job de keep-alive** (GitHub Actions) para evitarlo en producción. Migrar a Pro ($25/mes) antes del primer cliente activo.

---

## 4. Modelo de dominio

Ver `DATABASE.md` para el esquema completo en DBML y la lógica de negocio detallada.

### Entidades principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Extiende `auth.users` de Supabase. Puede existir sin inmobiliaria |
| `inmobiliarias` | La agencia (tenant). Campo `plan`: `free` o `mobi` |
| `membresias` | Une usuario ↔ inmobiliaria. Tiene `rol` y `estado` |
| `permisos_secciones` | Un booleano por sección, ligado a la membresía |
| `personas` | Locadores y locatarios. Pertenecen a una inmobiliaria |
| `alquileres` | Contratos. Datos del inmueble adentro |
| `personas_alquileres` | Tabla puente personas ↔ alquileres con rol |
| `documentos` | Archivos ligados a un alquiler (path a Supabase Storage) |
| `webs` | Perfil público de la inmobiliaria en mobi.com/[slug] |
| `publicaciones` | Propiedades en alquiler o venta. Independientes de `alquileres` |
| `publicaciones_plataformas` | Estado de cada publicación en cada plataforma externa |

### Reglas clave
- Un usuario pertenece a **una sola inmobiliaria** a la vez
- Un usuario puede existir **sin inmobiliaria** (usuario libre, viene de la calculadora)
- Puede haber **más de un admin** por inmobiliaria
- Las `personas` pertenecen a una inmobiliaria y **no se comparten** entre agencias
- Las `publicaciones` son **independientes** de `alquileres` (no hay FK entre ellas)
- Cada inmobiliaria tiene **una sola web** (`webs` tiene unique en `inmobiliaria_id`)

---

## 5. Roles y permisos

### Roles de membresía
- **Admin**: acceso total a todas las secciones. Puede invitar usuarios y asignar permisos. Puede haber más de uno por inmobiliaria.
- **Miembro**: solo accede a las secciones que el admin habilitó.

### Flujo de invitación
```
Admin carga nombre + email del nuevo usuario
        ↓
Sistema crea membresía en estado "pendiente"
con permisos_secciones asignados (todos false por defecto)
        ↓
Supabase envía email de invitación automáticamente
        ↓
Usuario hace click, elige contraseña, completa perfil
        ↓
Membresía pasa a estado "activa"
```

### Permisos por sección
- Acceso **todo o nada** (booleano): si tiene acceso puede realizar todas las operaciones.
- Los admins tienen acceso total **independientemente** de `permisos_secciones` — se valida a nivel de RLS y lógica de aplicación.
- En el front: el sidebar muestra solo las secciones permitidas. Las rutas están protegidas con `<RequireSection seccion="..." />`.

---

## 6. Secciones / módulos

| # | Sección | Slug | Descripción |
|---|---------|------|-------------|
| 1 | Calculadora de tasas | `calculadora-tasas` | Cálculo de tasas e intereses. También disponible como app gratuita externa |
| 2 | Calculadora IPC/ICL | `calculadora-ipc-icl` | Calcula aumentos de alquiler según índices del INDEC. Consume API externa vía Edge Function |
| 3 | Tabla de alquileres | `alquileres` | CRUD de contratos. Gestión de personas (locador/locatario) y documentos |
| 4 | Sitio Web | `sitio-web` | Gestión del catálogo público en `mobi.com/[slug]`. Tiene vista pública (sin login) y gestión interna |
| 5 | Publicaciones | `publicaciones` | CRUD de propiedades. Publicación en Zonaprop, MercadoLibre, Argenprop y web propia |
| 6 | Documentos | `documentos` | Formularios para que locador y locatario suban documentación. Archivos en Supabase Storage |

### Notas importantes
- **Sitio Web (4):** la ruta pública `mobi.com/[slug]` no requiere login. Tenerlo en cuenta en el router (rutas públicas vs. protegidas).
- **Publicaciones (5):** las integraciones con portales externos son placeholder por ahora. La lógica de OAuth y webhooks irá en Edge Functions cuando se implemente.
- **Calculadora de tasas (1):** es la única sección accesible también desde la app gratuita externa.

---

## 7. Estructura de carpetas

Organización **por features**. Cada sección es un feature autocontenido.

```
src/
  components/
    ui/                 # componentes shadcn (generados por CLI, no editar a mano)
    layout/             # AppLayout, Sidebar, Header, etc.
    shared/             # componentes reutilizables propios
  features/
    auth/               # login, registro, sesión, invitaciones
    inmobiliarias/      # onboarding, configuración de la agencia
    usuarios/           # alta de usuarios y gestión de permisos (admin)
    calculadora-tasas/
    calculadora-ipc-icl/
    alquileres/         # contratos, personas, documentos
    sitio-web/          # gestión del catálogo público
    publicaciones/      # propiedades y publicación multiplataforma
    documentos/         # carga de documentos
  hooks/                # hooks globales (useAuth, useInmobiliaria, etc.)
  lib/
    supabase.ts         # cliente de Supabase (único punto de acceso)
    utils.ts            # cn() y helpers generales
    sections.ts         # definición centralizada de las 6 secciones (slugs, labels, iconos)
  routes/               # configuración del router + guards (RequireAuth, RequireSection)
  store/                # estado global Zustand (sesión, usuario, inmobiliaria activa)
  types/                # tipos TypeScript compartidos
  App.tsx
  main.tsx
public/
supabase/
  migrations/           # archivos SQL de migraciones
  functions/            # Supabase Edge Functions
```

Convención por feature:
```
features/alquileres/
  components/     # UI específica del feature
  api/            # hooks de TanStack Query (useAlquileres, useCreateAlquiler, etc.)
  pages/          # páginas del feature (AlquileresPage, NuevoAlquilerPage, etc.)
  types.ts        # tipos específicos del feature
  index.ts        # exports públicos del feature
```

---

## 8. Convenciones de código

- Componentes en **PascalCase** (`AppLayout.tsx`); hooks en **camelCase** con prefijo `use`.
- Carpetas y slugs en **kebab-case**.
- Un componente por archivo; export nombrado salvo páginas/rutas (default export).
- Estilos: **solo Tailwind**. Para clases condicionales usar `cn()` de `src/lib/utils.ts`.
- Las 6 secciones (slugs, labels, iconos, permisos) se centralizan en `src/lib/sections.ts`. Sidebar, rutas y guards usan esa misma fuente.
- Nada de lógica de negocio en componentes de presentación; va en hooks o en `api/`.
- Todo acceso a Supabase va por `src/lib/supabase.ts` — nunca importar el cliente directo en un componente.
- Comentarios y nombres de dominio en **español**; nombres técnicos (hooks, funciones utilitarias) en inglés.
- Siempre filtrar `borrado_en IS NULL` en queries — nunca mostrar registros eliminados lógicamente.

---

## 9. Comandos

```bash
npm install                           # instalar dependencias
npm run dev                           # servidor de desarrollo (Vite)
npm run build                         # build de producción
npm run preview                       # previsualizar el build
npm run lint                          # linter

# shadcn/ui
npx shadcn@latest add <componente>    # agregar componentes UI

# Supabase CLI
supabase start                        # levantar Supabase local (Docker)
supabase db diff --use-migra          # generar migración desde cambios locales
supabase db push                      # aplicar migraciones a producción
supabase functions serve              # correr Edge Functions localmente
```

*(Ajustar si se usa pnpm/yarn.)*

---

## 10. Decisiones confirmadas

| Decisión | Resolución |
|----------|------------|
| Backend / Auth | **Supabase** (Auth + Postgres RLS + Storage) |
| Lenguaje | **TypeScript** |
| Niveles de permiso | **Booleano** (todo o nada por sección) |
| Sitio Web público | **Rutas públicas en el mismo proyecto** (`mobi.com/[slug]`) |
| Backend intermedio | **No** — front conecta directo a Supabase. Edge Functions para lógica externa |
| Estrategia de producto | **Calculadora gratuita → upgrade a MOBI** (misma DB, campo `plan`) |
| Borrado | **Lógico** (`borrado_en timestamptz`) en todas las tablas |

---

## 11. Decisiones pendientes

1. **Integraciones de publicación** (Zonaprop, MercadoLibre, Argenprop) — verificar disponibilidad de APIs y modelo de OAuth. Quedan como placeholder hasta que se implemente.
2. **App de calculadora gratuita** — ¿mismo repo (monorepo) o repo separado?
3. **Deploy** — definir plataforma (Vercel, Netlify, etc.) y configuración de dominios para `mobi.com/[slug]`.

---

## 12. Alcance inmediato

✅ **Listo:** modelo de dominio completo, esquema de base de datos en DBML (`DATABASE.md`), sistema de diseño (`DESIGN.md`).

🔜 **Siguiente paso:** generar SQL de migración para Supabase (tablas, RLS, triggers de `actualizado_en`).

🚫 **No hacer todavía:** lógica interna de cada calculadora, CRUD real, integraciones con portales externos, subida real de archivos — salvo pedido explícito.
