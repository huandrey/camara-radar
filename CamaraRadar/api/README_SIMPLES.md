# Setup Simples

## 1. Copie o arquivo .env.example para .env

```bash
cp .env.example .env
```

## 2. Edite o .env e coloque suas chaves

```bash
# Abra o arquivo .env e preencha:
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon
LLM_API_KEY=sk-sua-chave-openai  # Opcional
```

## 3. Instale dependências

```bash
pip install -r requirements.txt
```

## 4. Execute

```bash
python server.py
```

Pronto! A API vai usar LLM se você tiver a chave, ou formatação simples se não tiver.

