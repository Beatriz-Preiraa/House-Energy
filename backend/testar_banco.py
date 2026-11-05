from banco import testar_conexao

try:
    resultado = testar_conexao()
    print("Conexão com Supabase realizada com sucesso!")
    print("Dados encontrados:", resultado)

except Exception as erro:
    print("Falha na conexão:", erro)