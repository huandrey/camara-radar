# Release Notes Template para GitHub

Use este template ao criar um release no GitHub. Copie e cole no campo "Describe this release" do GitHub.

---

## 🎉 v0.1.0 - Initial Release

Primeiro release público do sistema de scraping da Câmara Municipal de Campina Grande.

### ✨ Principais Features

- **Pipeline de Sessões**: Sistema completo de coleta automatizada de sessões legislativas
- **Agendamento Automático**: 
  - Backfill a cada 1 hora (coleta histórica)
  - Execução diária às 18:30 (novas sessões)
- **API On-Demand**: Scraping manual de sessões específicas
- **Sistema de Eventos**: Arquitetura event-driven para extensibilidade
- **Persistência**: Integração com Supabase (PostgreSQL)
- **Logging Estruturado**: Sistema de logs com Pino
- **Tratamento de Erros**: Retry automático com exponential backoff

### 📦 O que está incluído

- ✅ Pipeline completo de sessões (fetch, parse, normalize, persist)
- ✅ Sistema de métricas e monitoramento
- ✅ Testes unitários e de integração
- ✅ Scripts utilitários para desenvolvimento
- ✅ Documentação completa (README, SUPABASE_SETUP)
- ✅ Sistema de eventos para extensibilidade futura

### 🚀 Como começar

1. Clone o repositório
2. Instale as dependências: `pnpm install`
3. Configure as variáveis de ambiente (veja `.env.example`)
4. Execute a migration do banco de dados
5. Execute: `pnpm run cron:daily` ou `pnpm run cron:backfill`

### 📚 Documentação

- [README.md](README.md) - Documentação completa
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Guia de setup do Supabase
- [CHANGELOG.md](CHANGELOG.md) - Histórico completo de mudanças

### 🔮 Próximos Passos

- Pipeline de detalhes de sessões
- Pipeline de ementas
- Pipeline de tramitação
- API REST para consulta de dados

---

**Versão completa do changelog**: Veja [CHANGELOG.md](CHANGELOG.md) para detalhes completos.


