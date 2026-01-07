"""
Script de teste para os endpoints da API
Testa sem precisar de LLM API key (usa fallback)
"""
import os
import sys
from alexa_endpoints import get_daily_summary, get_sessions_summary, format_sessions_for_llm

def test_without_llm():
    """
    Testa os endpoints sem LLM (modo fallback)
    """
    print("=" * 60)
    print("TESTE DOS ENDPOINTS - MODO SEM LLM (FALLBACK)")
    print("=" * 60)
    print()
    
    # Força modo sem LLM
    os.environ.pop("LLM_API_KEY", None)
    
    print("1. Testando get_daily_summary()...")
    print("-" * 60)
    try:
        result = get_daily_summary()
        print(f"✅ Sucesso!")
        print(f"   Sessions encontradas: {result['sessions_count']}")
        print(f"   LLM usado: {result.get('llm_used', False)}")
        print(f"   Texto gerado:")
        print(f"   {result['texto_alexa']}")
        print()
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        print()
    
    print("2. Testando get_sessions_summary()...")
    print("-" * 60)
    try:
        result = get_sessions_summary()
        print(f"✅ Sucesso!")
        print(f"   Sessions encontradas: {result['sessions_count']}")
        print(f"   LLM usado: {result.get('llm_used', False)}")
        print(f"   Texto gerado:")
        print(f"   {result['texto_alexa']}")
        print()
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        print()


def test_with_mock_data():
    """
    Testa formatação com dados mockados (não precisa de Supabase)
    """
    print("=" * 60)
    print("TESTE COM DADOS MOCKADOS")
    print("=" * 60)
    print()
    
    from alexa_endpoints import format_text_for_alexa
    
    mock_sessions = [
        {
            "type": "ORDINÁRIA",
            "title": "119ª Sessão Ordinária",
            "opening_date": "2025-01-06T14:00:00Z",
            "legislature": "19ª Legislatura",
            "legislative_session": "1ª Sessão Legislativa"
        },
        {
            "type": "SOLENE",
            "title": "Sessão Solene de Abertura",
            "opening_date": "2025-01-05T10:00:00Z",
            "legislature": "19ª Legislatura",
            "legislative_session": "1ª Sessão Legislativa"
        }
    ]
    
    sessions_text = format_sessions_for_llm(mock_sessions)
    print("Dados mockados formatados:")
    print(sessions_text)
    print()
    
    print("Texto para Alexa (fallback):")
    alexa_text = format_text_for_alexa(sessions_text, "daily_summary")
    print(alexa_text)
    print()


def test_api_server():
    """
    Testa o servidor Flask localmente
    """
    print("=" * 60)
    print("TESTE DO SERVIDOR FLASK")
    print("=" * 60)
    print()
    print("Para testar o servidor, execute:")
    print("  python server.py")
    print()
    print("Depois em outro terminal, teste com:")
    print("  curl http://localhost:5000/api/resumo")
    print("  curl http://localhost:5000/api/sessoes")
    print("  curl http://localhost:5000/health")
    print()


if __name__ == "__main__":
    print()
    print("🧪 TESTES DA API ALEXA ENDPOINTS")
    print()
    
    # Verifica variáveis de ambiente
    print("Verificando configuração...")
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        print("⚠️  AVISO: SUPABASE_URL ou SUPABASE_KEY não configurados!")
        print("   Os testes que precisam do Supabase vão falhar.")
        print("   Configure com:")
        print("   export SUPABASE_URL=your_url")
        print("   export SUPABASE_KEY=your_key")
        print()
    else:
        print("✅ Supabase configurado")
        print()
    
    llm_key = os.environ.get("LLM_API_KEY")
    if not llm_key:
        print("ℹ️  LLM_API_KEY não configurado - usando modo fallback")
        print()
    else:
        print("✅ LLM configurado")
        print()
    
    # Executa testes
    try:
        test_with_mock_data()
        test_without_llm()
        test_api_server()
        
        print("=" * 60)
        print("✅ TESTES CONCLUÍDOS")
        print("=" * 60)
        print()
        print("Próximos passos:")
        print("1. Configure SUPABASE_URL e SUPABASE_KEY")
        print("2. Execute: python server.py")
        print("3. Teste os endpoints com curl ou Postman")
        print("4. (Opcional) Configure LLM_API_KEY para usar LLM")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Testes interrompidos pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Erro durante os testes: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

