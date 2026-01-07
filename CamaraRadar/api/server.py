"""
Servidor Flask simples para endpoints da Alexa
Pode ser deployado no AWS Lambda usando Serverless Framework ou Zappa
"""
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
from alexa_endpoints import get_daily_summary, get_sessions_summary, get_single_day_summary

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


@app.route('/debug/config', methods=['GET'])
def debug_config():
    """Debug endpoint to check environment configuration"""
    import os
    return jsonify({
        "supabase_url_configured": bool(os.environ.get("SUPABASE_URL")),
        "supabase_key_configured": bool(os.environ.get("SUPABASE_KEY")),
        "gemini_key_configured": bool(os.environ.get("GEMINI_API_KEY")),
        "gemini_model": os.environ.get("GEMINI_MODEL", "not-set"),
        "environment": os.environ.get("RENDER", "local")
    })


@app.route('/api/resumo', methods=['GET'])
def resumo():
    """
    Endpoint principal para resumo do dia
    Retorna texto formatado para Alexa falar
    Usa LLM automaticamente se LLM_API_KEY estiver no .env
    """
    try:
        result = get_daily_summary()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in /api/resumo: {e}", exc_info=True)
        return jsonify({
            "texto_alexa": "Desculpe, ocorreu um erro ao buscar as informações.",
            "error": str(e)
        }), 500


@app.route('/api/sessoes', methods=['GET'])
def sessoes():
    """
    Endpoint para resumo de sessões
    Usa LLM automaticamente se LLM_API_KEY estiver no .env
    """
    try:
        result = get_sessions_summary()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in /api/sessoes: {e}", exc_info=True)
        return jsonify({
            "texto_alexa": "Desculpe, ocorreu um erro ao buscar as sessões.",
            "error": str(e)
        }), 500


@app.route('/api/ultimo-dia', methods=['GET'])
def ultimo_dia():
    """
    Endpoint para resumo do último dia com sessões
    Formato otimizado para speech (evita enumerações longas)
    Usa LLM automaticamente se GEMINI_API_KEY estiver no .env
    """
    try:
        result = get_single_day_summary()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in /api/ultimo-dia: {e}", exc_info=True)
        return jsonify({
            "texto_alexa": "Desculpe, ocorreu um erro ao buscar as informações.",
            "error": str(e)
        }), 500


if __name__ == '__main__':
    # Development mode
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, port=port, host='0.0.0.0')

