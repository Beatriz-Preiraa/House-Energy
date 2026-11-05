import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
chave = os.getenv("SUPABASE_KEY")

if not url or not chave:
    raise ValueError("Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env")

banco_dados = create_client(url, chave)


def testar_conexao():
    try:
        resposta = banco_dados.table("eletrodomesticos").select("*").limit(1).execute()
        return resposta.data
    except Exception as erro:
        raise ConnectionError(f"Erro ao conectar ao Supabase: {erro}")