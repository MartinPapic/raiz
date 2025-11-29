import os
import google.generativeai as genai
from typing import Optional

# Configure API Key
# Ideally this should be in an environment variable
# For now, we will check if it exists, otherwise warn
from dotenv import load_dotenv

load_dotenv()

# Configure API Key
# Ideally this should be in an environment variable
# For now, we will check if it exists, otherwise warn
API_KEY = os.environ.get("GEMINI_API_KEY")
print(f"DEBUG: GEMINI_API_KEY found: {bool(API_KEY)}")

if API_KEY:
    genai.configure(api_key=API_KEY)

def generate_article_content(title: str, summary: str, source_text: str = "") -> dict:
    """
    Generates a synthetic article using Gemini.
    Returns a dictionary with 'title' and 'content'.
    """
    if not API_KEY:
        print("WARNING: GEMINI_API_KEY not found. Returning original content.")
        return {"title": title, "content": summary}

    try:
        print("DEBUG: Starting Gemini generation...")
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # 🤖 PROMPT MULTI-AGENTE / AGENTE AUTÓNOMO DE VARIOS PASOS PARA REESCRITURA DE NOTICIAS (GEMINI 2.5)

        prompt = f"""
        Eres un **agente autónomo de periodismo asistido por IA**.  
        Tu misión es **buscar noticias, analizarlas, extraer hechos y reescribirlas** con calidad profesional, neutralidad editorial y originalidad total.

        La tarea debe ejecutarse mediante **pasos estructurados**.  
        No puedes saltarte pasos ni combinarlos.

        ---

        # 🚦 FASES DEL PROCESO (EJECUTARLAS SIEMPRE EN ESTE ORDEN)

        ## 🟦 **FASE 1 — Comprensión**
        1. Lee la noticia completa.
        2. Identifica:  
           - Tema principal  
           - Actores relevantes  
           - Cronología  
           - Lugar  
           - Origen de la información (autoridades, instituciones, medios)
        3. Evalúa la completitud. **IMPORTANTE:** Asume que el texto es completo a menos que haya frases cortadas abruptamente. No descartes información válida.

        **Salida FASE 1:**  
        Breve confirmación del entendimiento en 5-8 bullet points.

        ---

        ## 🟩 **FASE 2 — Extracción de hechos esenciales**
        Extrae **TODA** la información factual disponible, especialmente:
        - Cifras exactas (dinero, cantidades, porcentajes).
        - Fechas específicas.
        - Nombres propios y cargos.
        - Lugares precisos.
        - Citas textuales (márcalas para usarlas o parafrasearlas con precisión).

        **Reglas:**  
        - Nada de opiniones.  
        - Nada de adornos.  
        - Nada de inferencias no fundamentadas.  
        - **NO OMITAS DATOS DUROS.** Si el texto dice "$14 mil millones", debes extraerlo.

        **Salida FASE 2:**  
        Tabla o lista con los hechos esenciales extraídos.

        ---

        ## 🟧 **FASE 3 — Reconstrucción narrativa**
        Construye una **plantilla narrativa** basada en los hechos extraídos:
        - Orden cronológico o de relevancia (pirámide invertida).
        - Agrupa los datos técnicos para no perderlos.

        **Salida FASE 3:**  
        Un esquema en 6-10 puntos.

        ---

        ## 🟥 **FASE 4 — Reescritura periodística original**
        Reescribe el artículo siguiendo estas reglas:

        ### 🔒 Reglas obligatorias
        - **Prohibido copiar frases** del texto original (plagio).  
        - Todo debe ser **reformulado** desde cero pero manteniendo la **exactitud de los datos**.
        - Estilo periodístico moderno: claro, preciso, verificable.  
        - Párrafos de 2-4 líneas.  
        - Tono neutral, sin opiniones.  
        - **NO INVENTES** que falta información si el texto fuente tiene datos.
        - **NO ESPECULES** sobre lo que "podría incluir" el proyecto si el texto ya dice lo que incluye.
        - Integra las cifras y datos técnicos de forma natural en el relato.

        ### 📰 Estructura obligatoria
        - Titular: Llamativo, informativo, máximo 15 palabras.
        - Cuerpo: Extenso y detallado, entre 600 y 1000 palabras (o lo que permita la fuente, sin rellenar).
        - Subtítulos: Úsalos para organizar temas.
        - Tags: 3 palabras clave.

        ---

        ## 🏁 **FASE 5 — Formato de Salida Final**
        
        IMPORTANTE: Tu respuesta final debe ser UNICAMENTE un objeto JSON válido.
        No incluyas el texto de las fases anteriores en la respuesta final.
        
        Formato JSON requerido:
        {{
            "title": "Titular generado en Fase 4",
            "content": "Cuerpo del artículo generado en Fase 4",
            "tags": ["tag1", "tag2", "tag3"]
        }}
        
        Título Original: {title}
        Resumen/Contexto: {summary}
        {f'Texto Fuente: {source_text}' if source_text else ''}
        """

        response = model.generate_content(prompt)
        
        # Simple parsing (Gemini usually returns markdown json or plain text)
        # We will try to extract JSON if possible, or just use the text
        text = response.text
        
        # Clean up markdown code blocks if present
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
            
        import json
        data = json.loads(text)
        
        return {
            "title": data.get("title", title),
            "content": data.get("content", summary),
            "tags": data.get("tags", [])
        }

    except Exception as e:
        print(f"Error generating content with Gemini: {e}")
        return {"title": title, "content": summary}

def refine_article_content(content: str, instruction: str) -> str:
    """
    Refines existing article content based on a specific instruction using Gemini.
    """
    if not API_KEY:
        print("WARNING: GEMINI_API_KEY not found. Returning original content.")
        return content

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Actúa como un editor experto. Tu tarea es modificar el siguiente texto periodístico siguiendo estrictamente esta instrucción:
        
        INSTRUCCIÓN: {instruction}
        
        TEXTO ORIGINAL:
        {content}
        
        IMPORTANTE: Devuelve ÚNICAMENTE el texto modificado. No añadas introducciones, explicaciones ni comillas adicionales. Mantén el formato original (párrafos, etc.) a menos que la instrucción diga lo contrario.
        """

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error refining content with Gemini: {e}")
        return content

def audit_article_content(content: str, original_content: str = "") -> str:
    """
    Audits the article content for errors using Gemini.
    """
    if not API_KEY:
        return "Error: API Key not found."

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Eres un agente auditor especializado en revisar artículos reescritos por otra IA. 
        No debes corregir ni reescribir: SOLO DETECTAR ERRORES.

        ---
        
        TEXTO ORIGINAL (FUENTE):
        {original_content if original_content else "No disponible (evaluar solo coherencia interna y estilo)"}

        TEXTO A AUDITAR (BORRADOR):
        {content}

        ---

        # 🧭 PROCESO DE REVISIÓN OBLIGATORIO (5 CATEGORÍAS)

        ## 🟥 1. ERRORES DE FACTUALIDAD
        Detecta:
        - Datos no presentes en la noticia original.
        - Información especulativa o inferida.
        - Declaraciones atribuidas sin confirmación.
        - Detalles técnicos añadidos sin respaldo.
        - Fechas, cifras o lugares sin fuente.
        - Predicciones o comparaciones inventadas.

        ## 🟧 2. ERRORES DE ESTILO PERIODÍSTICO
        Revisar:
        - Lenguaje sensacionalista o dramático.
        - Adjetivos valorativos.
        - Frases demasiado largas.
        - Falta de neutralidad.
        - Voz pasiva excesiva.
        - Estilo inconsistente con periodismo informativo.

        ## 🟨 3. ERRORES DE ESTRUCTURA
        Comprobar si se cumple:
        - Titular
        - Bajada
        - Cuerpo (3 a 6 párrafos)
        - Datos clave
        Si falta alguno, reportarlo.

        ## 🟩 4. ERRORES DE TRANSPARENCIA EDITORIAL
        Detecta:
        - Contexto añadido sin avisar.
        - Mezcla de hechos con opinión.
        - Juicios no respaldados.
        - Afirmaciones fuertes sin fuente.

        ## 🟦 5. ERRORES RESPECTO AL PROMPT ORIGINAL
        Verificar:
        - Si se copiaron frases de la fuente.
        - Si agregó información no permitida.
        - Si ignoró reglas de estilo.
        - Si incumplió estructura obligatoria.
        - Si omitió señalar datos faltantes.

        ---

        # 📤 FORMATO DE SALIDA REQUERIDO
        El agente debe responder SIEMPRE con este formato:

        ## 1. Errores de factualidad
        [lista]

        ## 2. Errores de estilo periodístico
        [lista]

        ## 3. Errores de estructura
        [lista]

        ## 4. Errores de transparencia editorial
        [lista]

        ## 5. Errores respecto al prompt original
        [lista]

        ## Resumen crítico
        [3–5 conclusiones: ¿es apto para publicación o no?]

        ---
        
        NOTAS IMPORTANTES:
        - Si no hay errores en una categoría, indicar explícitamente: "sin errores detectados".
        - Ante duda, clasificar como "riesgo de factualidad".
        - Nunca inventar hechos nuevos.
        - Nunca corregir el artículo. Solo DETECTAR.
        """

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Error auditing content with Gemini: {e}")
        return f"Error auditing content: {str(e)}"
