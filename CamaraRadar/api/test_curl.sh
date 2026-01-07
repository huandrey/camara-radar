#!/bin/bash

# Script para testar os endpoints da API usando curl
# Execute após iniciar o servidor com: python server.py

echo "🧪 Testando endpoints da API..."
echo ""

BASE_URL="${1:-http://localhost:5000}"

echo "1. Testando /health"
echo "-------------------"
curl -s "$BASE_URL/health" | python -m json.tool
echo ""
echo ""

echo "2. Testando /api/resumo"
echo "----------------------"
curl -s "$BASE_URL/api/resumo" | python -m json.tool
echo ""
echo ""

echo "3. Testando /api/sessoes"
echo "-----------------------"
curl -s "$BASE_URL/api/sessoes" | python -m json.tool
echo ""
echo ""

echo "✅ Testes concluídos!"

