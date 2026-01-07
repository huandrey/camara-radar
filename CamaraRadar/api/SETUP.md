# Setup Simples - 3 Passos

## 1. Configure o .env na raiz do projeto

O arquivo `.env.example` já existe na raiz do projeto. Se ainda não tiver o `.env`, copie:

```bash
# Na raiz do projeto (não em CamaraRadar/api)
cp .env.example .env
```

## 2. Edite o .env e adicione suas chaves

Abra o arquivo `.env` **na raiz do projeto** e preencha:

```bash
# OBRIGATÓRIO
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-anon

# OPCIONAL (se não colocar, usa formatação simples sem LLM)
LLM_API_KEY=sk-sua-chave-openai
```

## 3. Execute a API

```bash
cd CamaraRadar/api
pip install -r requirements.txt
python server.py
```

Pronto! 

- Se você colocou `LLM_API_KEY`, vai usar GPT para gerar relatórios
- Se não colocou, vai usar formatação simples (funciona perfeitamente!)

