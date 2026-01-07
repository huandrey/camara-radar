# ADR 003: Design da API para Alexa Skill

**Status**: Em Revisão

**Data**: 2026-01-07

**Contexto**: Precisamos fornecer informações sobre sessões da Câmara via voz (Alexa). O conteúdo deve ser:
- Jornalístico e imparcial
- Natural para ser ouvido (speech-friendly)
- Contextualizado com informações relevantes
- Curto e objetivo (máximo 150 palavras)

**Decisão**: Criar endpoints REST específicos para Alexa que retornam texto formatado para fala, utilizando Gemini LLM para gerar resumos jornalísticos a partir dos dados estruturados.

## Endpoints Implementados

### 1. `/api/resumo`
Resumo geral dos últimos dias (não recomendado para speech por ser muito longo)

### 2. `/api/sessoes`
Resumo de sessões recentes (3 dias)

### 3. `/api/ultimo-dia` (RECOMENDADO)
Resumo focado apenas no último dia com sessões registradas.

**Por quê?** Evita enumerações longas e cansativas como "119ª, 118ª, 117ª, 116ª..."

## Dados Disponíveis para Resumo

### Da tabela `sessions`:
- Tipo de sessão
- Data
- Legislatura
- Horários
- URLs de mídia

### Da tabela `session_order_of_day`:
- **Ementas** (texto completo das matérias)
- Situação das matérias
- Resultados de votações

### Da tabela `session_attendance`:
- Lista de presença
- Parlamentares ausentes

## Problema Identificado

**Atual**: A API só consulta a tabela `sessions`, ignorando as ementas e detalhes da ordem do dia.

**Consequência**: Os resumos ficam vazios, dizendo apenas "foram realizadas sessões" sem informar **o que** foi discutido.

**Solução**: A API deve:
1. Buscar sessão básica da tabela `sessions`
2. Buscar ordem do dia com ementas da tabela `session_order_of_day`
3. (Opcional) Buscar presença da tabela `session_attendance`
4. Passar todos esses dados para o LLM gerar resumo contextualizado

## Formato de Prompt para LLM

O prompt deve:
- Instruir tom jornalístico imparcial
- Evitar adjetivos valorativos
- Focar nos fatos
- Usar linguagem natural para speech
- Priorizar informações das ementas
- Evitar enumerações longas de números ordinais

## Implementação Necessária

```python
def get_single_day_summary():
    # 1. Buscar sessões do último dia
    sessions = get_last_day_sessions()
    
    # 2. Para cada sessão, buscar ordem do dia
    for session in sessions:
        ordem_dia = get_ordem_dia(session.session_id)
        session.ementas = [item.ementa for item in ordem_dia]
    
    # 3. Formatar dados completos para LLM
    sessions_text = format_sessions_with_ementas(sessions)
    
    # 4. Gerar resumo jornalístico
    news_report = generate_news_report(sessions_text, "single_day")
    
    return news_report
```

## Consequências

**Positivas**:
- Resumos contextualizados e informativos
- Usuário realmente entende o que aconteceu
- Experiência de voz muito melhor
- Tom jornalístico sério e imparcial

**Negativas**:
- Necessário consultar múltiplas tabelas
- Mais dados para processar
- Custo de API do LLM pode aumentar

