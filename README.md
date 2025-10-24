# 🎫 Ticket Management Portal - AlingUP

<div align="center">
  <h3>Portal moderno de gestión integral de tickets de servicio técnico</h3>
  <p>Construido con React, Tailwind CSS y Supabase con diseño <strong>Apple Liquid Glass</strong></p>
</div>

---

## ✨ Características Principales

### 🎯 **Gestión de Tickets**
- ✅ **Tablero Kanban interactivo** para seguimiento visual en tiempo real
- ✅ **Autenticación basada en roles** (Cliente, Técnico, Administrador)
- ✅ **Gestión completa de tickets** con estados y prioridades
- ✅ **Archivos adjuntos y notas de voz** para mejor comunicación
- ✅ **Dashboards analíticos** con métricas en tiempo real
- ✅ **Diseño responsive** con interfaz moderna Liquid Glass

### 🎨 **Experiencia Visual Inmersiva**
- **Glassmorphism auténtico** con efectos de cristal y desenfoque
- **Orbes flotantes animados** que crean profundidad y movimiento
- **Gradientes dinámicos** con transiciones suaves
- **Superficies translúcidas** con backdrop-filter
- **Animaciones fluidas** y efectos hover sofisticados

### 👥 **Roles y Permisos**
- **Cliente**: Crear tickets, ver historial, comunicación directa
- **Técnico**: Tablero Kanban, gestión de carga de trabajo, métricas
- **Administrador**: Panel ejecutivo, analytics, gestión de usuarios

## 🛠️ Stack Tecnológico

### **Frontend**
- **Framework**: React 19.1+ con Vite (Rolldown)
- **Estilos**: Tailwind CSS v3.4 con clases personalizadas
- **Enrutamiento**: React Router v7.9+
- **Gestión de Estado**: React Context API
- **Iconografía**: Lucide React
- **Drag & Drop**: @hello-pangea/dnd v18+
- **Gráficos**: Recharts v3.3+

### **Backend & Servicios**
- **BaaS**: Supabase (PostgreSQL + Auth + Storage)
- **Base de datos**: PostgreSQL con RLS (Row Level Security)
- **Autenticación**: Supabase Auth con roles personalizados
- **Almacenamiento**: Supabase Storage para archivos y audio

### **Herramientas de Desarrollo**
- **Build Tool**: Vite (Rolldown) con optimizaciones de producción
- **Linter**: ESLint v9+ con reglas personalizadas
- **Testing**: Vitest con cobertura de código
- **Type Checking**: TypeScript con validación estricta
- **Editor de Texto Rico**: TinyMCE React

## 🚀 Inicio Rápido

### **Prerrequisitos**

- **Node.js** 18+ 
- **npm** o **yarn**
- Cuenta de **Supabase** (gratuita)

### **Instalación**

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ticket-management-portal
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

4. **Configurar credenciales de Supabase** en `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### **Scripts Disponibles**

#### **Desarrollo**
```bash
npm run dev              # Inicia servidor de desarrollo
npm run lint             # Ejecuta linter
npm run lint:fix         # Corrige errores de linting
npm run type-check       # Verifica tipos de TypeScript
```

#### **Testing**
```bash
npm run test             # Ejecuta tests
npm run test:watch       # Ejecuta tests en modo watch
npm run test:coverage    # Genera reporte de cobertura
```

#### **Build**
```bash
npm run build                # Build para producción
npm run build:staging        # Build para staging
npm run build:analyze        # Build con análisis de bundle
npm run preview              # Vista previa del build
```

#### **Despliegue**
```bash
npm run deploy:staging       # Despliega a staging
npm run deploy:production    # Despliega a producción
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── admin/          # Componentes de administración
│   │   ├── AdminSettings.jsx
│   │   ├── ClientManagement.jsx
│   │   ├── SystemSettings.jsx
│   │   └── TechnicianManagement.jsx
│   ├── attachments/    # Manejo de archivos y multimedia
│   │   ├── FileUpload.jsx
│   │   ├── VoiceRecorder.jsx
│   │   ├── ImageGallery.jsx
│   │   └── DocumentViewer.jsx
│   ├── auth/           # Autenticación y protección de rutas
│   │   ├── LoginForm.jsx
│   │   ├── PasswordReset.jsx
│   │   └── ProtectedRoute.jsx
│   ├── comments/       # Sistema de comentarios
│   │   ├── CommentForm.jsx
│   │   └── CommentList.jsx
│   ├── common/         # Componentes comunes (Glass UI)
│   │   ├── GlassCard.jsx
│   │   ├── AlingUPLogo.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   ├── dashboards/     # Dashboards por rol
│   │   ├── ClientDashboard.jsx
│   │   ├── TechnicianDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── KPICard.jsx
│   ├── kanban/         # Tablero Kanban
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   └── TicketCard.jsx
│   └── tickets/        # Gestión de tickets
│       ├── TicketForm.jsx
│       ├── TicketList.jsx
│       └── TicketDetail.jsx
├── contexts/            # Proveedores de contexto
│   ├── AuthContext.jsx
│   ├── TicketContext.jsx
│   └── ThemeContext.jsx
├── hooks/               # Hooks personalizados
│   ├── useAuth.js
│   ├── useTickets.js
│   └── useSupabase.js
├── pages/               # Páginas principales
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── CreateTicket.jsx
│   ├── Tickets.jsx
│   └── TicketDetail.jsx
├── services/            # Servicios y API
│   ├── supabaseClient.js
│   ├── ticketService.js
│   ├── authService.js
│   └── storageService.js
├── utils/               # Utilidades y constantes
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── styles/              # Estilos globales
│   └── index.css       # Tailwind + Animaciones Glass
└── main.jsx             # Punto de entrada
```

## 🔐 Variables de Entorno

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Environment-specific configurations
VITE_APP_ENV=development  # development | staging | production
```

## 🎨 Características del Diseño Liquid Glass

### **Efectos Visuales Implementados**
- **Glassmorphism auténtico** con `backdrop-filter: blur(16px)`
- **Orbes flotantes animados** con CSS keyframes
- **Gradientes dinámicos** con transiciones suaves
- **Superficies translúcidas** con transparencias calculadas
- **Animaciones escalonadas** para entrada fluida de elementos
- **Efectos hover 3D** con transformaciones sutiles

### **Componentes Glass Principales**
- `GlassCard`: Tarjetas translúcidas base
- `AlingUPLogo`: Logo con efectos glass y animaciones
- Glass buttons, inputs, modals y contenedores
- Hero headers con estadísticas en tiempo real

## 📊 Dashboards por Rol

### **Cliente Dashboard**
- Centro personal con logo animado y KPIs
- Tarjetas de acción para crear tickets
- Historial de tickets en contenedores glass
- Gráficos de actividad reciente
- Métricas de satisfacción

### **Técnico Dashboard**
- Centro de trabajo con badge de rendimiento
- Filtros rápidos con inputs glass
- Tablero Kanban integrado
- Métricas de productividad
- Vista colapsible de estadísticas

### **Admin Dashboard**
- Panel ejecutivo con métricas empresariales
- Tarjetas KPI con gradientes
- Gráficos de analytics en tiempo real
- Tiempo de resolución por prioridad
- Gestión de usuarios y sistema

## 🔒 Seguridad

- **Row Level Security (RLS)** en Supabase
- **Autenticación JWT** con refresh tokens
- **Roles y permisos** granulares por usuario
- **Protección de rutas** con ProtectedRoute
- **Validación de entrada** en todos los formularios
- **Sanitización de datos** en comentarios y archivos

## 🚀 Performance

### **Optimizaciones Implementadas**
- **Code splitting** automático con Vite
- **Lazy loading** de componentes pesados
- **Memoización** con React.memo y useMemo
- **Animaciones GPU** aceleradas con transform
- **Imágenes optimizadas** con LazyImage
- **Bundle analysis** para identificar cuellos de botella

### **Métricas Objetivo**
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

### **Cobertura de Tests**
- Componentes críticos: > 80%
- Servicios y utilidades: > 90%
- Hooks personalizados: 100%

## 📱 Responsive Design

- **Mobile First**: Diseñado primero para móviles
- **Breakpoints optimizados**: sm, md, lg, xl, 2xl
- **Touch-friendly**: Áreas de toque ampliadas
- **Adaptive layouts**: Grid y flexbox responsivos
- **Performance móvil**: Optimizado para 3G/4G

## 🌐 Navegadores Soportados

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+
- ⚠️ Internet Explorer: No soportado

## 📚 Documentación Adicional

- [Dashboard Redesign](./DASHBOARD_REDESIGN.md) - Detalles del diseño Liquid Glass de dashboards
- [Pages Redesign](./PAGES_REDESIGN.md) - Detalles de páginas de gestión de tickets
- [Database Schema](./database/README.md) - Esquema de base de datos

## 🤝 Contribución

Este es un proyecto personal. Si tienes sugerencias o encuentras bugs:
1. Abre un issue describiendo el problema
2. Incluye capturas de pantalla si es relevante
3. Especifica tu navegador y versión

## 📄 Licencia

This project is private and proprietary.

## 🙏 Agradecimientos

- **React Team**: Por el increíble framework
- **Tailwind CSS**: Por el sistema de diseño flexible
- **Supabase**: Por el backend simplificado
- **Lucide**: Por los iconos hermosos
- **Apple Design**: Inspiración para el estilo Liquid Glass

---

<div align="center">
  <p>Desarrollado con ❤️ usando React, Tailwind CSS, Supabase y mucha creatividad</p>
  <p><strong>AlingUP</strong> - Transformando la gestión de servicios técnicos</p>
</div>
