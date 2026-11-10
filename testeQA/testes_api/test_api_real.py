import requests

BASE_URL = "http://127.0.0.1:8000"

def test_api_responde_200():
    resposta = requests.get(f"{BASE_URL}/saude", timeout=10)
    assert resposta.status_code == 200

def test_api_esta_ativa():
    resposta = requests.get(f"{BASE_URL}/saude", timeout=10)
    assert resposta.status_code == 200
    assert resposta.json()["estado"] == "ativa"

def test_consulta_leituras_supabase():
    resposta = requests.get(f"{BASE_URL}/saude", timeout=10)
    assert resposta.status_code == 200
    quantidade = resposta.json()["leituras_registradas"]
    assert isinstance(quantidade, int)
    assert quantidade >= 0
