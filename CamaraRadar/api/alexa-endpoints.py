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

# Carrega variáveis do arquivo .env (busca na raiz do projeto)
load_dotenv(dotenv_path='../../.env')

# Configurar logging
logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

# Configurações (carrega de .env ou variáveis de ambiente)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
LLM_API_KEY = os.environ.get("LLM_API_KEY")  # OpenAI, Anthropic, etc. (opcional)
LLM_API_URL = os.environ.get("LLM_API_URL", "https://api.openai.com/v1/chat/completions")

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
        
        formatted.append(
            f"Sessão {session.get('type', 'N/A')} - {session.get('title', 'Sem título')} "
            f"realizada em {date_str}. "
            f"Legislatura: {session.get('legislature', 'N/A')}, "
            f"Sessão Legislativa: {session.get('legislative_session', 'N/A')}."
        )
    
    return "\n".join(formatted)


def generate_news_report(sessions_data: str, prompt_type: str = "daily_summary") -> str:
    """
    Usa LLM para gerar um relatório em formato de notícia a partir dos dados das sessões
    Se não houver LLM_API_KEY, usa formatação simples
    
    Args:
        sessions_data: Texto formatado com dados das sessões
        prompt_type: Tipo de prompt ("daily_summary", "session_details", etc.)
    
    Returns:
        Texto formatado para a Alexa falar
    """
    # Se não tiver chave do LLM, usa formatação simples
    if not LLM_API_KEY:
        logger.info("LLM_API_KEY não configurada, usando formatação simples")
        return format_text_for_alexa(sessions_data, prompt_type)
    
    prompts = {
        "daily_summary": """Você é um jornalista especializado em política municipal. 
Com base nos dados abaixo sobre sessões da Câmara Municipal de Campina Grande, 
gere um resumo em formato de notícia radiofônica, curto (máximo 150 palavras), 
em português brasileiro, natural e conversacional, como se fosse para um locutor de rádio ler.

Dados das sessões:
{sessions_data}

Gere apenas o texto da notícia, sem títulos ou formatação.""",
        
        "session_details": """Você é um jornalista especializado em política municipal.
Com base nos dados abaixo sobre uma sessão da Câmara Municipal, 
gere uma explicação curta (máximo 100 palavras), em português brasileiro, 
natural e conversacional.

Dados da sessão:
{sessions_data}

Gere apenas o texto explicativo."""
    }
    
    prompt_template = prompts.get(prompt_type, prompts["daily_summary"])
    prompt = prompt_template.format(sessions_data=sessions_data)
    
    # Configuração para OpenAI (pode ser adaptado para outros LLMs)
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gpt-3.5-turbo",  # ou gpt-4, claude, etc.
        "messages": [
            {"role": "system", "content": "Você é um assistente jornalístico especializado em política municipal brasileira."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 300
    }
    
    try:
        response = requests.post(LLM_API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        if content:
            return content.strip()
        else:
            return sessions_data  # Fallback para dados brutos
            
    except Exception as e:
        logger.error(f"Error calling LLM API: {e}")
        return sessions_data  # Fallback para dados brutos


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
            "llm_used": False
        }
    
    # Formata dados
    sessions_text = format_sessions_for_llm(sessions)
    
    # Gera relatório (usa LLM se disponível, senão formatação simples)
    news_report = generate_news_report(sessions_text, "daily_summary")
    
    return {
        "texto_alexa": news_report,
        "sessions_count": len(sessions),
        "llm_used": bool(LLM_API_KEY)
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
            "llm_used": False
        }
    
    sessions_text = format_sessions_for_llm(sessions)
    news_report = generate_news_report(sessions_text, "session_details")
    
    return {
        "texto_alexa": news_report,
        "sessions_count": len(sessions),
        "llm_used": bool(LLM_API_KEY)
    }

