# Raíz — Medio Inteligente para Comunicación Sostenible

**Impulsado por IA + RAG + Curaduría Humana**

Raíz es un medio digital automatizado que combina inteligencia artificial responsable, tecnologías RAG y curaduría editorial humana para acelerar la comunicación sobre sostenibilidad en Latinoamérica.

## 🚀 Funcionalidades

- **Ingesta Automática e Inteligente**:
    - Recopilación programada (cada 1 hora) desde feeds RSS (ej. BBC, El País).
    - **Web Scraping**: Extracción del contenido completo.
    - **Historial de Conexiones**: Monitoreo de éxito/fallo de cada fuente.
- **Generación con IA (Gemini)**:
    - **Reescritura Periodística**: Artículos únicos basados en hechos.
    - **Auditoría de Contenido**: Revisión automática de factualidad y estilo.
    - **Refinamiento**: Edición con instrucciones en lenguaje natural.
- **Búsqueda Semántica (RAG)**: Búsqueda de artículos relevantes con embeddings (FAISS).
- **Modo Curador**:
    - Flujo: Borrador -> Publicado -> Archivado.
    - Gestión de Fuentes (CRUD).
    - Control del Scheduler (Iniciar/Detener/Ejecutar ahora).
- **Autenticación**: JWT con roles (admin/user).

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (Turbopack), React 19, TailwindCSS 4.
- **Backend**: FastAPI, SQLModel (SQLite), Pydantic.
- **IA / Data**:
    - `google-generativeai` (Gemini 1.5 Flash).
    - `sentence-transformers` + `faiss-cpu` (RAG).
    - `beautifulsoup4` (Scraping).
    - `apscheduler` (Automatización).
    - `argon2` + `python-jose` (Seguridad).

## 📦 Instalación y Ejecución

### Prerrequisitos
- Python 3.10+
- Node.js 18+
- Clave de API de Google Gemini (en `.env`)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate # Mac/Linux

pip install -r requirements.txt

# Configuración: Crea .env con GEMINI_API_KEY=tu_clave

# Inicialización
python seed_user.py          # Admin inicial (admin/admin123)
python seed_south_america.py # Fuentes iniciales

# Iniciar servidor (Incluye Scheduler)
.\start_server.ps1
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
Acceso: `http://localhost:3000`

### 🧪 Testing y Verificación

El backend incluye scripts de verificación en la carpeta raíz (`backend/`):

- `python check_ingestion_fix.py`: Prueba la lógica de ingesta.
- `python debug_auth.py`: Diagnóstico de autenticación.
- `python check_user_mgmt.py`: Verifica gestión de usuarios.
- `.\kill8000.ps1`: (Windows) Libera el puerto 8000 si se bloquea.

## 🗺 Roadmap

1. **MVP (Completado)**: Ingesta, RAG, Curaduría, Auth, Gemini.
2. **Fase 2 (En Progreso)**:
    - [x] Automatización de ingesta (Scheduler implementado).
    - [ ] Despliegue (Docker/Cloud).
    - [ ] Consolidación de Tests (Migrar scripts a `pytest`).
3. **Escalamiento**: PostgreSQL, Analytics.

## Licencia
MIT. Autor: Martín Papic.
