# HouseEnergy AI - Testes de QA

**Responsável:** Ivanilton  
**Função:** Testes de QA e Entrega

## Ferramentas utilizadas
- Pytest: testes automatizados da API.
- Apache JMeter: testes de carga e desempenho.
- GitHub Actions: automação dos testes.

## Testes de API
Foram executados 12 testes automatizados utilizando Pytest e banco de dados simulado.

**Resultados:**
- 12 testes aprovados.
- 0 testes reprovados.
- 1 aviso de dependência.
- Tempo de execução: 4,01 segundos.

## Testes de carga
Plano de testes preparado no Apache JMeter.
A execução depende da API estar funcionando.

## GitHub Actions
Workflow preparado para executar os testes automaticamente.

## Observações
Nenhum código do frontend ou backend foi alterado.

A integração real com Supabase ainda não foi validada.

## Resultado atualizado dos testes Pytest

Responsavel: Ivanilton
Data: 10/11/2026

Foram executados 15 testes automatizados:

- 12 testes utilizando banco de dados simulado.
- 3 testes consultando a API real conectada ao Supabase.
- 15 testes aprovados.
- 0 testes reprovados.
- 1 aviso de dependencia.
- Tempo total: 8,38 segundos.

Os testes reais verificaram a rota /saude.
Nao foram realizadas gravacoes ou exclusoes no banco.

O relatorio completo esta em:
evidencias/resultado-pytest-completo.txt

Observacao: os testes reais exigem que a API
esteja funcionando. O GitHub Actions continua
executando os testes sem depender do Supabase.
