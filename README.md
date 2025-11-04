# 🌿 Raíz — Medio de Comunicación Inteligente y Sostenible

**Raíz** es un medio de comunicación digital impulsado por **inteligencia artificial (IA)** y **tecnologías RAG (Retrieval-Augmented Generation)**, diseñado para **profesionales del área de las comunicaciones** y **emprendimientos sostenibles** que buscan información precisa, automatizada y con sentido humano.

El objetivo de Raíz es **acelerar la producción y distribución de contenidos de valor sobre sostenibilidad, innovación y cultura ecológica**, combinando automatización, ética comunicacional y diseño visual consciente.

---

## 🧭 Propósito

> “Acelerar la comunicación sostenible en Chile y Latinoamérica mediante inteligencia artificial responsable.”

Raíz no es solo un medio automatizado.  
Es una **plataforma colaborativa** que conecta la tecnología con los valores del desarrollo sostenible, ofreciendo contenido actualizado, curado y analizado por sistemas IA con supervisión humana.

---

## 🌍 Público objetivo

- Comunicadores, periodistas y community managers enfocados en sostenibilidad, innovación y educación.  
- Emprendedores verdes que necesitan estar informados sin perder tiempo.  
- Instituciones educativas y fundaciones interesadas en IA y comunicación ética.

---

## 🧠 Características principales

- 📰 **Generación automática de artículos y resúmenes** desde fuentes verificadas (APIs, RSS, prensa digital).
- 🔎 **Sistema RAG** para enriquecer los textos con contexto actualizado y citas relevantes.
- 🗂️ **Base de datos vectorial** para búsquedas semánticas y recuperación inteligente de información.
- 💬 **Panel de curaduría** para editar, aprobar o mejorar artículos generados por IA.
- 📈 **Análisis temático** sobre tendencias en sostenibilidad, educación ambiental y ecodiseño.
- 🪴 **Diseño minimalista y ecológico**, enfocado en velocidad, accesibilidad y hosting verde.

---

## ⚙️ Stack tecnológico (MVP)

| Componente | Herramienta / Tecnología | Función |
|-------------|--------------------------|----------|
| **Frontend** | Next.js / Astro | Interfaz web rápida y ligera |
| **Backend API** | Python + FastAPI | Gestión de scraping, IA y publicación |
| **IA / RAG** | OpenAI GPT-4/5 + ChromaDB / FAISS | Generación y recuperación aumentada |
| **Base de datos** | Supabase | Usuarios, artículos, etiquetas, sesiones |
| **Scraping y fuentes** | RSS / NewsData.io / Google News | Alimentación de datos verificados |
| **Dashboard interno** | Streamlit o Next.js admin panel | Control editorial y análisis |
| **Hosting** | Vercel / Render / Supabase | Infraestructura cloud |
| **Automatización** | Python scripts + cron jobs | Tareas de actualización diaria |
| **Diseño visual** | Figma / TailwindCSS | Interfaz limpia y coherente con valores sostenibles |

---

## 👥 Historias de usuario

### 🧩 Comunicador/a
> Como **comunicador especializado en sostenibilidad**, quiero **recibir artículos generados automáticamente con fuentes confiables**, para **mantenerme actualizado sin invertir tiempo en búsqueda manual**.

### 📰 Editor/a o curador/a
> Como **editor de contenidos**, necesito **validar y mejorar textos generados por IA**, asegurando **veracidad, coherencia y tono editorial humano**.

### 🧑‍💻 Administrador técnico
> Como **administrador del sistema**, quiero **monitorear el rendimiento del scraping y la base de datos**, para **garantizar estabilidad, velocidad y precisión en la información**.

---

## ✅ Requerimientos funcionales

1. **Gestión de usuarios**  
   - Registro, autenticación y roles: lector, curador, administrador.  
   - Panel personalizado según tipo de usuario.

2. **Generación automática de contenido**  
   - Captura diaria de fuentes RSS y APIs verificadas.  
   - Resumen automático mediante modelo IA.  
   - Enriquecimiento contextual con sistema RAG.

3. **Curaduría y publicación**  
   - Validación y edición del contenido por humanos.  
   - Estado de artículo: *borrador*, *revisado*, *publicado*.  
   - Control de versiones.

4. **Análisis y visualización**  
   - Dashboard con métricas (tendencias, frecuencia temática, engagement).  
   - Clasificación automática de artículos por categorías sostenibles (energía, reciclaje, innovación social, etc.).

5. **Automatización programada**  
   - Ejecución de scraping y regeneración de resúmenes cada 24 horas.  
   - Notificaciones a curadores sobre nuevos artículos pendientes.

6. **Interfaz ecológica y responsiva**  
   - Diseño mobile-first con optimización de recursos.  
   - Compatibilidad con dark/light mode.

---

## 🧩 Requerimientos no funcionales

| Tipo | Descripción |
|------|--------------|
| **Rendimiento** | Los tiempos de respuesta del backend no deben superar 500ms promedio por solicitud. |
| **Escalabilidad** | Capacidad para manejar 10.000 artículos indexados y 1.000 usuarios concurrentes. |
| **Accesibilidad** | Cumplimiento de estándar WCAG 2.1 nivel AA. |
| **Sostenibilidad digital** | Hosting verde (energía renovable, baja huella de carbono). |
| **Seguridad** | Tokens JWT, HTTPS, validación de entrada y protección contra inyección. |
| **Mantenibilidad** | Código modular, documentado y con pruebas unitarias. |

---

## 🧾 Validaciones clave (MVP)

1. ✅ **Integración IA-RAG**  
   - Verificar coherencia y relevancia de las citas generadas.  
   - Evaluar precisión semántica frente a artículos originales.

2. ✅ **Calidad de scraping**  
   - Garantizar que >90% de los artículos provengan de fuentes verificadas.  
   - Detección de duplicados o contenido no fiable.

3. ✅ **Experiencia del usuario (UX)**  
   - Test con 5 comunicadores y 5 emprendedores verdes.  
   - Feedback sobre claridad, utilidad y estética.

4. ✅ **Curaduría híbrida (IA + humano)**  
   - Validar tiempo promedio de revisión por artículo.  
   - Medir reducción de carga editorial en al menos 40%.

5. ✅ **Consumo energético del sitio**  
   - Analizar huella digital mediante [Website Carbon Calculator](https://www.websitecarbon.com/).  
   - Iterar sobre optimizaciones de rendimiento y peso visual.

---

## 📈 Futuras integraciones

- Extensión de navegador para lectura rápida y curaduría directa.  
- Chatbot de análisis temático con búsqueda semántica (IA + RAG).  
- API pública para medios y universidades sostenibles.  
- Integración con redes sociales y newsletters automáticas.  

---

## 🪴 Licencia

Este proyecto está bajo la **Licencia MIT**.  
Puedes usar, modificar y distribuir este software libremente, siempre que se mantenga la atribución original a su autor.

---

**Autor:** [Martín Papic](https://github.com/MartinPapic)  
**Repositorio:** [github.com/MartinPapic/raiz](https://github.com/MartinPapic/raiz)

