# Mobi · CRM Inmobiliario

App shell del CRM multi-inmobiliaria. Esta entrega cubre el **layout general** y la **navegación**: las secciones de negocio quedan como placeholders.

## Stack

- React 18 + Vite 6 + TypeScript
- Tailwind CSS 3 (tokens del design system)
- React Router 6
- lucide-react (iconografía fina, monocromática)
- Tipografía Geist (Google Fonts)

## Arrancar

```bash
cd mobi-app
npm install
npm run dev
```

Vite levanta el dev server en http://localhost:5173.

## Qué hay implementado

- **App shell de 3 regiones**: sidebar izquierdo fijo (256px, colapsable en mobile), topbar plano con selector de inmobiliaria, y área de contenido aireada.
- **Sidebar**:
  - Marca arriba.
  - CTA `Nueva propiedad` (acción primaria, negro).
  - Navegación: Dashboard, Calculadora de tasas, Calculadora IPC/ICL, Alquileres, Sitio Web, Publicaciones, Documentos, Usuarios.
  - Pinneados: indicador de prueba (`10 días restantes` + `Suscribirme`) y `Configuración`.
- **Topbar**:
  - Toggle del sidebar.
  - Selector multi-tenant con nombre de la inmobiliaria + badge de plan (`Mobi` / `Free`). Dropdown con sombra suave (única excepción a la regla de "sin sombras").
  - Buscador con hint `Ctrl K`, botón `Ayuda`, avatar con iniciales.
- **Dashboard / Bienvenida**:
  - Patrón de onboarding con dos grupos colapsables: `Configurá tu inmobiliaria` (5 ítems) y `Empezá a usar Mobi` (4 ítems).
  - Contador `done/total` por grupo (ej. `0/5`).
  - Cada fila: checkbox + título + ayuda + acción primaria.
  - Botón `Marcar todo completo` arriba a la derecha.
- **Páginas placeholder** reutilizables (`PagePlaceholder`) aplicadas a:
  - Alquileres
  - Calculadora de tasas
  - Calculadora IPC/ICL
  - Sitio Web
  - Publicaciones
  - Documentos
  - Usuarios
  - Configuración (catch-all desde el sidebar)

## Sistema de diseño

Definido en `tailwind.config.js`:

| Token | Valor |
|-------|-------|
| `bg-canvas` | `#fafaf7` (fondo principal cálido) |
| `bg-surface` | `#f4f4f0` (superficies, hover, item activo, inputs) |
| `text-ink` | `#0c0c09` (texto principal) |
| `text-ink-secondary` | `#5b5b4b` (texto secundario, nav inactiva) |
| `text-ink-muted` | `#6f6f60` (terciario) |
| `border-line` | `#e8e8e3` (bordes finos 1px) |
| `bg-primary` | `#181811` (CTA fuerte, near-black) |
| `text-primary-foreground` | `#f4f4f0` |
| `text-danger` | `#b42318` |
| `rounded-sm/md/lg/xl` | 4 / 8 / 14 / 18 px |
| `shadow-float` | única sombra permitida, reservada al dropdown |

Tipografía Geist en todo. Títulos 600 con tracking ajustado; cuerpo regular; navegación y labels en 14px medium. Sin mayúsculas forzadas.

## Estructura

```
src/
  components/
    ui/           # button, badge, checkbox, input, avatar, card
    layout/       # AppLayout, Sidebar, Topbar
    shared/       # PageHeader, PagePlaceholder
  features/
    dashboard/pages/DashboardPage.tsx
    alquileres/pages/AlquileresPage.tsx
    calculadora-tasas/pages/CalculadoraTasasPage.tsx
    calculadora-ipc-icl/pages/CalculadoraIPCICLPage.tsx
    sitio-web/pages/SitioWebPage.tsx
    publicaciones/pages/PublicacionesPage.tsx
    documentos/pages/DocumentosPage.tsx
    usuarios/pages/UsuariosPage.tsx
  lib/
    sections.ts   # fuente única de las 8 entradas de navegación
    utils.ts      # cn()
  routes/         # configuración del router
  index.css       # tokens base + reset
  main.tsx
```

## Próximos pasos

Esta entrega es solo el shell. Faltan, en orden sugerido:

1. Integrar `shadcn/ui` real (`npx shadcn@latest init`) y reemplazar los componentes UI propios donde sea conveniente.
2. Conectar Supabase (`src/lib/supabase.ts`) + RLS multi-tenant.
3. Auth + guards `RequireAuth` / `RequireSection`.
4. Implementar las secciones de negocio (alquileres, calculadoras, publicaciones, etc.).
