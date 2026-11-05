from fastapi.testclient import TestClient

from aplicativo import api

cliente = TestClient(api)


def test_rota_inicial():
    resposta = cliente.get("/")
    assert resposta.status_code == 200
    assert resposta.json()["estado"] == "ativa"


def test_criar_leitura():
    resposta = cliente.post("/leituras", json={
        "eletrodomestico": "Geladeira teste",
        "consumo_kwh": 0.2,
        "valor_kwh": 0.92,
        "origem": "aplicativo"
    })
    assert resposta.status_code == 200
    assert resposta.json()["custo_estimado"] == 0.18


def test_resumo():
    resposta = cliente.get("/resumo")
    assert resposta.status_code == 200
    assert "consumo_total_kwh" in resposta.json()


def test_rejeitar_consumo_negativo():
    resposta = cliente.post("/leituras", json={
        "eletrodomestico": "Geladeira teste",
        "consumo_kwh": -1,
        "valor_kwh": 0.92
    })
    assert resposta.status_code == 422
