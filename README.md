# 🇩🇴 Collado Europa Conecta

Red digital oficial de dominicanos en Europa que apoyan a **David Collado**.

![Stack](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)

---

## ✨ Funcionalidades

- 🔐 Autenticación completa (registro/login) con Supabase
- 💬 Chat en tiempo real por país y sala temática
- 📰 Feed de noticias sobre David Collado
- 📅 Calendario de eventos comunitarios
- 👥 Directorio de miembros con filtro por país
- 🛡️ Rutas protegidas con middleware de sesión
- 📱 Diseño responsive con colores de la bandera dominicana

---

## 🚀 Guía de Despliegue Completa

### PASO 1 — Instalar herramientas necesarias

1. **Node.js** → https://nodejs.org (versión LTS)
2. **Git** → https://git-scm.com/download/win

> Reinicia tu PC tras instalar.

---

### PASO 2 — Configurar Supabase

1. Ve a **https://supabase.com** y crea una cuenta gratuita
2. Crea un **New Project** (ej: `collado-europa`)
3. Ve a **SQL Editor** → pega y ejecuta todo el contenido de `supabase/schema.sql`
4. Ve a **Settings → API** y copia:
   - `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. En **Authentication → URL Configuration**, añade en *Site URL*:
   - `https://TU-APP.vercel.app`

---

### PASO 3 — Configurar variables de entorno

Edita el archivo `.env.local` con tus datos reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

### PASO 4 — Instalar dependencias y probar localmente

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

### PASO 5 — Subir a GitHub

```bash
git init
git add .
git commit -m "🇩🇴 Collado Europa Conecta - Launch"
git branch -M main
```

Luego ve a **https://github.com/new** y crea un repositorio llamado `collado-europa-conecta`.  
Copia los comandos que te da GitHub para conectar y hacer push:

```bash
git remote add origin https://github.com/TU_USUARIO/collado-europa-conecta.git
git push -u origin main
```

---

### PASO 6 — Desplegar en Vercel

1. Ve a **https://vercel.com** y crea una cuenta (puedes usar tu cuenta de GitHub)
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio `collado-europa-conecta` desde GitHub
4. En **Environment Variables**, añade:
   | Nombre | Valor |
   |--------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Anon Key de Supabase |
5. Haz clic en **"Deploy"** ✅

Tu app estará disponible en: `https://collado-europa-conecta.vercel.app`

---

### PASO 7 — Crear el primer administrador

Después de registrarte en la app:

1. Ve a Supabase → **Table Editor** → tabla `profiles`
2. Busca tu usuario y cambia el campo `role` a `admin`
3. Ahora podrás publicar noticias desde el panel

---

## 📁 Estructura del Proyecto

```
collado/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Layout global
│   │   ├── globals.css           # Estilos globales
│   │   ├── login/page.tsx        # Inicio de sesión
│   │   ├── register/page.tsx     # Registro
│   │   └── dashboard/
│   │       ├── layout.tsx        # Sidebar + navbar
│   │       ├── page.tsx          # Dashboard home
│   │       ├── chat/page.tsx     # Chat en tiempo real
│   │       ├── news/page.tsx     # Noticias
│   │       ├── events/page.tsx   # Eventos
│   │       └── members/page.tsx  # Directorio miembros
│   ├── lib/
│   │   └── supabase.ts          # Cliente Supabase
│   └── middleware.ts             # Protección de rutas
├── supabase/
│   └── schema.sql               # Esquema completo DB
├── .env.local                   # Variables de entorno (NO subir a Git)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 🎨 Tecnologías

| Tecnología | Uso |
|------------|-----|
| **Next.js 14** | Framework React con App Router |
| **Supabase** | Base de datos, auth y realtime |
| **TypeScript** | Tipado estático |
| **Vercel** | Hosting y despliegue automático |

---

## 📞 Soporte

¿Tienes preguntas? Escribe en el chat de la comunidad 🇩🇴
