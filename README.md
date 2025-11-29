# Raíz — Medio Inteligente para Comunicación Sostenible

**Impulsado por IA + RAG + Curaduría Humana**

Raíz es un medio digital automatizado que combina inteligencia artificial responsable, tecnologías RAG y curaduría editorial humana para acelerar la comunicación sobre sostenibilidad en Latinoamérica.

## 🚀 Funcionalidades (MVP)

- **Ingesta Automática**: Recopilación de artículos desde feeds RSS (ej. BBC, El País).
- **Web Scraping**: Extracción del contenido completo de los artículos originales.
- **Generación con IA (Gemini)**:
    - **Reescritura Periodística**: Generación de artículos únicos basados en hechos extraídos.
    - **Auditoría de Contenido**: Revisión automática de factualidad, estilo y estructura.
    - **Refinamiento**: Edición asistida por instrucciones en lenguaje natural.
- **Búsqueda Semántica (RAG)**: Búsqueda de artículos relevantes utilizando embeddings (FAISS).
- **Base de Conocimiento**: Almacenamiento y sugerencia de información contextual relevante.
- **Modo Curador**:
    - Flujo de trabajo: Borrador -> Publicado -> Archivado.
    - Edición manual y asistida por IA.
    - **Gestión de Fuentes**: Administración de feeds RSS y lista de conexiones exitosas.
    - **Historial de Conexiones**: Registro de intentos de ingesta y resultados.
- **Autenticación**: Acceso seguro para curadores (JWT) con roles (admin/user).

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (Turbopack), React 19, TailwindCSS 4.
- **Backend**: FastAPI, SQLModel (SQLite), Pydantic.
- **IA / Data**:
    - `google-generativeai` (Gemini 1.5 Flash) para generación y razonamiento.
    - `sentence-transformers` para embeddings.
    - `faiss-cpu` para base de datos vectorial.
    - `beautifulsoup4` para scraping.
    - `argon2` + `python-jose` para seguridad.

## 📦 Instalación y Ejecución

### Prerrequisitos
- Python 3.10+
- Node.js 18+
- Clave de API de Google Gemini (en `.env`)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Configuración
# Crea un archivo .env con: GEMINI_API_KEY=tu_clave_aqui

# Scripts de Inicialización
python seed_user.py          # Crear usuario admin inicial
python seed_south_america.py # Cargar 20 fuentes de Sudamérica

# Iniciar servidor (Script optimizado para Windows)
.\start_server.ps1
```

**Scripts de Utilidad:**
- `.\kill8000.ps1`: Mata procesos zombies bloqueando el puerto 8000.
- `python debug_auth.py`: Verifica credenciales de usuario.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:3000`.

## 🔐 Credenciales por Defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 🗺 Roadmap

1. **MVP (Completado)**: Ingesta, RAG, Curaduría, Auth, Integración Gemini (Generación/Auditoría).
2. **Fase 2 (Próximos Pasos)**:
    - Automatización de ingesta (Cron jobs / Celery).
    - Despliegue (Docker/Vercel/Render).
    - Soporte para múltiples usuarios y roles granulares.
3. **Escalamiento**: Base de datos PostgreSQL, Analytics avanzado.

## Licencia

MIT. Autor: Martín Papic.
