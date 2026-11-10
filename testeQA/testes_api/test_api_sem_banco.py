"""Testes automatizados da API com banco simulado, sem Supabase real.

Estes testes carregam o arquivo ORIGINAL backend/aplicativo.py.
A dependência banco é substituída SOMENTE durante os testes.
"""
import importlib.util
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

RAIZ = Path(__file__).resolve().parents[2]
ARQUIVO_BACKEND = RAIZ / "backend" / "aplicativo.py"
if not ARQUIVO_BACKEND.is_file():
    raise RuntimeError(f"Arquivo da API nao encontrado: {ARQUIVO_BACKEND}")

banco_falso = ModuleType("banco")
banco_falso.banco_dados = None

with patch.dict(sys.modules, {"banco": banco_falso}):
    spec = importlib.util.spec_from_file_location("houseenergy_api_qa", ARQUIVO_BACKEND)
    aplicativo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(aplicativo)

cliente = TestClient(aplicativo.api)

def test_rota_inicial_responde_200():
    resposta = cliente.get("/")
    assert resposta.status_code == 200
    assert resposta.json() == {"mensagem": "API HouseEnergy AI", "estado": "ativa"}

def test_documentacao_openapi_disponivel():
    resposta = cliente.get("/openapi.json")
    assert resposta.status_code == 200
    assert "/leituras" in resposta.json()["paths"]
    assert "/resumo" in resposta.json()["paths"]

@pytest.mark.parametrize("campo,valor", [
    ("consumo_kwh", -1),
    ("consumo_kwh", 0),
    ("consumo_kwh", 1001),
    ("valor_kwh", 0),
    ("valor_kwh", 101),
    ("eletrodomestico", "A"),
    ("origem", "desconhecida"),
])
def test_leitura_invalida_retorna_422(campo, valor):
    dados = {"eletrodomestico": "Geladeira", "consumo_kwh": 0.2,
             "valor_kwh": 0.92, "origem": "aplicativo"}
    dados[campo] = valor
    resposta = cliente.post("/leituras", json=dados)
    assert resposta.status_code == 422

def test_leitura_valida_calcula_custo(monkeypatch):
    class BancoSimulado:
        def table(self, _nome):
            return self
        def insert(self, registro):
            self.registro = registro
            return self
        def execute(self):
            return SimpleNamespace(data=[{"id": 123, **self.registro}])

    monkeypatch.setattr(aplicativo, "buscar_eletrodomestico", lambda nome: 10)
    monkeypatch.setattr(aplicativo, "detectar_anomalia", lambda ident, valor: None)
    monkeypatch.setattr(aplicativo, "banco_dados", BancoSimulado())
    resposta = cliente.post("/leituras", json={
        "eletrodomestico": "Geladeira", "consumo_kwh": 0.2,
        "valor_kwh": 0.92, "origem": "aplicativo"})
    assert resposta.status_code == 200
    assert resposta.json()["custo_estimado"] == 0.18
    assert resposta.json()["identificador"] == 123

def test_resumo_calcula_totais(monkeypatch):
    leituras = [
        {"consumo_kwh": 1.5, "custo_estimado": 1.20, "anomalia": True},
        {"consumo_kwh": 1.0, "custo_estimado": 0.80, "anomalia": None},
    ]
    monkeypatch.setattr(aplicativo, "consultar_leituras", lambda: leituras)
    resposta = cliente.get("/resumo")
    assert resposta.status_code == 200
    dados = resposta.json()
    assert dados["consumo_total_kwh"] == 2.5
    assert dados["custo_total_reais"] == 2.0
    assert dados["quantidade_leituras"] == 2
    assert dados["quantidade_anomalias"] == 1
    assert dados["quantidade_sem_analise"] == 1

def test_previsao_sem_leituras_retorna_400(monkeypatch):
    monkeypatch.setattr(aplicativo, "consultar_leituras", lambda: [])
    resposta = cliente.get("/previsao")
    assert resposta.status_code == 400
    assert "Registre leituras" in resposta.json()["detail"]
