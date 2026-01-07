"""
Endpoints específicos para Alexa Skill - retornam texto formatado para fala
"""
import os
from dotenv import load_dotenv
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from google import genai

# Carrega variáveis do arquivo .env (busca na raiz do projeto)
load_dotenv(dotenv_path='../../.env')

# Configurar logging
logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

# Configurações (carrega de .env ou variáveis de ambiente)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("LLM_API_KEY")  # Gemini API Key
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp")  # Modelo padrão

# Inicializa cliente Gemini se houver chave
gemini_client = None
if GEMINI_API_KEY:
    try:
        os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
        gemini_client = genai.Client()
        logger.info(f"Gemini client initialized with model {GEMINI_MODEL}")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        gemini_client = None

def get_sessions_today() -> List[Dict]:
    """
    Busca sessões do dia atual do Supabase
    Retorna lista de sessões
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Supabase credentials not configured")
        return []
    
    today = datetime.now().date()
    url = f"{SUPABASE_URL}/rest/v1/sessions"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {
        "opening_date": f"gte.{today.isoformat()}",
        "opening_date": f"lt.{(today + timedelta(days=1)).isoformat()}",
        "order": "opening_date.desc",
        "limit": "10"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        return []


def get_recent_sessions(days: int = 1, limit: int = 5) -> List[Dict]:
    """
    Busca sessões recentes dos últimos N dias
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    
    start_date = (datetime.now() - timedelta(days=days)).date()
    url = f"{SUPABASE_URL}/rest/v1/sessions"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {
        "opening_date": f"gte.{start_date.isoformat()}",
        "order": "opening_date.desc",
        "limit": str(limit)
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching recent sessions: {e}")
        return []


def format_text_for_alexa(sessions_data: str, prompt_type: str = "daily_summary") -> str:
    """
    Formata texto para Alexa sem usar LLM (fallback quando LLM não está disponível)
    Cria um texto natural e conversacional a partir dos dados das sessões
    """
    if not sessions_data or sessions_data == "Nenhuma sessão encontrada.":
        return "Não encontrei sessões recentes na Câmara Municipal de Campina Grande."
    
    lines = sessions_data.split("\n")
    
    if prompt_type == "daily_summary":
        intro = "Hoje na Câmara Municipal de Campina Grande, "
        if len(lines) == 1:
            return intro + lines[0].lower() + "."
        else:
            text = intro + f"foram realizadas {len(lines)} sessões. "
            text += " ".join([line.lower() + "." for line in lines[:3]])
            if len(lines) > 3:
                text += f" E mais {len(lines) - 3} outras sessões."
            return text
    else:
        return "Nas sessões recentes da Câmara Municipal: " + ". ".join([line.lower() for line in lines[:3]]) + "."


def format_sessions_for_llm(sessions: List[Dict]) -> str:
    """
    Formata dados das sessões em texto estruturado para o LLM processar
    Inclui informações da ordem do dia (ementas) quando disponível
    """
    if not sessions:
        return "Nenhuma sessão encontrada."
    
    formatted = []
    for session in sessions:
        date_str = session.get("opening_date", "")
        if date_str:
            try:
                date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                date_str = date_obj.strftime("%d de %B de %Y")
            except:
                pass
        
        session_text = (
            f"Sessão {session.get('type', 'N/A')} - {session.get('title', 'Sem título')} "
            f"realizada em {date_str}. "
            f"Legislatura: {session.get('legislature', 'N/A')}, "
            f"Sessão Legislativa: {session.get('legislative_session', 'N/A')}."
        )
        
        # Adiciona informações da ordem do dia (pauta)
        ordem_dia = session.get("ordem_dia", [])
        if ordem_dia:
            session_text += f"\n\nPauta da sessão ({len(ordem_dia)} itens):"
            for i, item in enumerate(ordem_dia[:5], 1):  # Limita a 5 itens principais
                ementa = item.get("ementa", "").strip()
                content = item.get("content", "").strip()
                resultado = item.get("result", "").strip()
                
                if ementa:
                    item_text = f"\n{i}. {ementa}"
                elif content:
                    item_text = f"\n{i}. {content}"
                else:
                    continue
                
                if resultado and resultado != "-":
                    item_text += f" (Resultado: {resultado})"
                
                session_text += item_text
            
            if len(ordem_dia) > 5:
                session_text += f"\n... e mais {len(ordem_dia) - 5} itens."
        else:
            session_text += "\n\nPauta não disponível ou não coletada."
        
        formatted.append(session_text)
    
    return "\n\n---\n\n".join(formatted)


def generate_news_report(sessions_data: str, prompt_type: str = "daily_summary") -> str:
    """
    Usa Gemini para gerar um relatório em formato de notícia a partir dos dados das sessões
    Se não houver GEMINI_API_KEY, usa formatação simples
    
    Args:
        sessions_data: Texto formatado com dados das sessões
        prompt_type: Tipo de prompt ("daily_summary", "session_details", etc.)
    
    Returns:
        Texto formatado para a Alexa falar
    """
    # Se não tiver cliente Gemini, usa formatação simples
    if not gemini_client:
        logger.info("Gemini client not available, usando formatação simples")
        return format_text_for_alexa(sessions_data, prompt_type)
    
    prompts = {
        "daily_summary": """Você é um jornalista objetivo e imparcial especializado em cobertura política municipal. 
Com base nos dados abaixo sobre sessões da Câmara Municipal de Campina Grande, 
gere um resumo jornalístico em formato de notícia radiofônica, curto (máximo 150 palavras), 
em português brasileiro.

DIRETRIZES IMPORTANTES:
- Seja objetivo e factual, relatando apenas os fatos
- Mantenha tom neutro e imparcial, sem adjetivos elogiosos ou valorativos
- Evite termos como "importante", "relevante", "grande", "excelente", "destaque"
- Use linguagem clara e direta, apropriada para jornalismo sério
- Apresente informações sem emitir juízo de valor
- Foque nos dados: tipo de sessão, data, pautas discutidas

Dados das sessões:
{sessions_data}

Gere apenas o texto da notícia, sem títulos ou formatação.""",
        
        "single_day": """Você é um jornalista objetivo e imparcial especializado em cobertura política municipal.
Com base nos dados abaixo sobre sessões da Câmara Municipal de Campina Grande realizadas em um dia específico,
gere um resumo jornalístico em formato de notícia radiofônica, curto (máximo 150 palavras), 
em português brasileiro.

DIRETRIZES IMPORTANTES:
- Seja objetivo e factual, relatando apenas os fatos
- Mantenha tom neutro e imparcial, sem adjetivos elogiosos
- Evite enumerar sessões com números ordinais extensos (119ª, 118ª, etc)
- PRIORIZE informar O QUE foi discutido/votado (as ementas da pauta)
- Se houver múltiplas sessões, mencione brevemente e foque nas pautas mais relevantes
- Use linguagem natural e conversacional, apropriada para ser ouvida
- Foque no conteúdo das ementas, não nos números das sessões
- Se houver informação sobre pautas/ementas, SEMPRE mencione as principais
- Se não houver pauta disponível, mencione apenas tipo de sessão e data
- Evite jargões técnicos complexos, use linguagem acessível

Dados da sessão (incluindo pauta quando disponível):
{sessions_data}

Gere apenas o texto da notícia para ser falado, focando no que foi discutido.""",
        
        "session_details": """Você é um jornalista objetivo e imparcial especializado em política municipal. 
Com base nos dados abaixo sobre uma sessão da Câmara Municipal, 
gere uma explicação curta (máximo 100 palavras), em português brasileiro.

DIRETRIZES IMPORTANTES:
- Seja objetivo e factual, sem adjetivos valorativos
- Mantenha tom neutro e profissional
- Relate apenas os fatos, sem interpretações ou elogios
- Use linguagem jornalística séria

Dados da sessão:
{sessions_data}

Gere apenas o texto explicativo."""
    }
    
    prompt_template = prompts.get(prompt_type, prompts["daily_summary"])
    prompt = prompt_template.format(sessions_data=sessions_data)
    
    try:
        # Usa biblioteca oficial do Google Generative AI
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        
        content = response.text if hasattr(response, 'text') else ""
        
        if content:
            logger.info("Gemini gerou texto com sucesso")
            return content.strip()
        else:
            logger.warning("Gemini retornou conteúdo vazio, usando fallback")
            return format_text_for_alexa(sessions_data, prompt_type)
            
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}")
        return format_text_for_alexa(sessions_data, prompt_type)  # Fallback


def get_daily_summary() -> Dict[str, str]:
    """
    Endpoint principal: retorna resumo do dia formatado para Alexa
    Usa LLM se LLM_API_KEY estiver configurada, senão usa formatação simples
    """
    sessions = get_sessions_today()
    
    if not sessions:
        # Se não houver sessões hoje, busca das últimas 24h
        sessions = get_recent_sessions(days=1, limit=5)
    
    if not sessions:
        return {
            "texto_alexa": "Não encontrei sessões recentes na Câmara Municipal de Campina Grande.",
            "sessions_count": 0,
            "gemini_used": False
        }
    
    # Formata dados
    sessions_text = format_sessions_for_llm(sessions)
    
    # Gera relatório (usa Gemini se disponível, senão formatação simples)
    news_report = generate_news_report(sessions_text, "daily_summary")
    
    return {
        "texto_alexa": news_report,
        "sessions_count": len(sessions),
        "gemini_used": bool(gemini_client)
    }


def get_order_of_day(session_id: int) -> List[Dict]:
    """
    Busca a ordem do dia (pauta) de uma sessão específica
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    
    url = f"{SUPABASE_URL}/rest/v1/session_order_of_day"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {
        "session_id": f"eq.{session_id}",
        "order": "order_number.asc",
        "limit": "100"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching order of day for session {session_id}: {e}")
        return []


def get_last_day_sessions() -> List[Dict]:
    """
    Busca todas as sessões do dia mais recente que tem registro
    E também busca a ordem do dia de cada sessão
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    
    url = f"{SUPABASE_URL}/rest/v1/sessions"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Busca a sessão mais recente primeiro
    params = {
        "order": "opening_date.desc",
        "limit": "1"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        latest = response.json()
        
        if not latest:
            return []
        
        # Pega a data da sessão mais recente
        latest_date = latest[0].get("opening_date", "")
        if not latest_date:
            return []
        
        # Extrai apenas a data (sem hora)
        date_obj = datetime.fromisoformat(latest_date.replace("Z", "+00:00"))
        target_date = date_obj.date()
        next_date = target_date + timedelta(days=1)
        
        # Busca todas as sessões desse dia específico
        # Supabase precisa de parâmetros separados para range
        url_with_filters = f"{url}?opening_date=gte.{target_date.isoformat()}&opening_date=lt.{next_date.isoformat()}&order=opening_date.desc&limit=20"
        
        response = requests.get(url_with_filters, headers=headers)
        response.raise_for_status()
        sessions = response.json()
        
        # Para cada sessão, busca a ordem do dia
        for session in sessions:
            session_id = session.get("session_id")
            if session_id:
                ordem_dia = get_order_of_day(session_id)
                session["ordem_dia"] = ordem_dia
        
        return sessions
        
    except Exception as e:
        logger.error(f"Error fetching last day sessions: {e}")
        return []


def get_single_day_summary() -> Dict[str, str]:
    """
    Retorna resumo apenas do último dia com sessões registradas
    Formato otimizado para fala (speech), evitando enumerações longas
    """
    sessions = get_last_day_sessions()
    
    if not sessions:
        return {
            "texto_alexa": "Não encontrei sessões recentes na Câmara Municipal de Campina Grande.",
            "sessions_count": 0,
            "gemini_used": False
        }
    
    # Formata dados
    sessions_text = format_sessions_for_llm(sessions)
    
    # Gera relatório com prompt específico para um único dia
    news_report = generate_news_report(sessions_text, "single_day")
    
    return {
        "texto_alexa": news_report,
        "sessions_count": len(sessions),
        "gemini_used": bool(gemini_client),
        "date": sessions[0].get("opening_date", "").split("T")[0] if sessions else None
    }


def get_sessions_summary() -> Dict[str, str]:
    """
    Retorna resumo das sessões recentes
    Usa LLM se LLM_API_KEY estiver configurada, senão usa formatação simples
    """
    sessions = get_recent_sessions(days=3, limit=5)
    
    if not sessions:
        return {
            "texto_alexa": "Não encontrei sessões recentes.",
            "sessions_count": 0,
            "gemini_used": False
        }
    
    sessions_text = format_sessions_for_llm(sessions)
    news_report = generate_news_report(sessions_text, "session_details")
    
    return {
        "texto_alexa": news_report,
        "sessions_count": len(sessions),
        "gemini_used": bool(gemini_client)
    }

