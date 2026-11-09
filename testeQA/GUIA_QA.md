# HouseEnergy AI — QA (Integrante 3)

Estes arquivos NAO substituem nem alteram `backend/` ou `frontend/`.

## 1. Pytest em modo isolado (sem Supabase)

Execute na raiz do projeto (pasta que contem `backend`, `frontend`, `testeQA`):

```powershell
.\testeQA\.venv\Scripts\Activate.ps1
python -m pytest -v testeQA/testes_api/test_api_sem_banco.py
```

Os testes carregam o codigo original de `backend/aplicativo.py`, mas substituem
a dependencia do banco por objetos simulados. Validam respostas e regras da API.
NAO comprovam conectividade ao Supabase, MQTT, aplicativo Android nem o servidor real.

## 2. GitHub Actions

Coloque `.github/workflows/qa-pytest.yml` na raiz do repositorio Git.
Faça o commit e o push. Em GitHub > Actions, escolha 'QA - Pytest sem Supabase'
e `Run workflow`, ou altere um arquivo de `testeQA/` e envie um push.
O arquivo `relatorio-pytest.xml` e publicado como artefato da execucao.
Sem `SUPABASE_URL`, `SUPABASE_KEY` e sem EXPO_TOKEN.

## 3. JMeter

Abra `testeQA/jmeter/houseenergy_carga.jmx` no JMeter (File > Open).
Parametros padrao: 10 usuarios, rampa de 10 s, 5 repeticoes por usuario.
A API deve estar rodando em `http://127.0.0.1:8000` ANTES de executar o JMeter.
Esta API NAO inicia enquanto faltar configuracao do Supabase; nesse caso,
registre o teste como BLOQUEADO (nao 'aprovado' nem 'falhou por lentidao').
O plano envia somente GET / (sem gravar leituras).

Execucao grafica: abra o arquivo e clique no botao iniciar (triangulo verde).
Execucao por terminal (dentro da pasta raiz, com o `jmeter` no PATH):

```powershell
jmeter -n -t testeQA/jmeter/houseenergy_carga.jmx -l testeQA/evidencias/carga.jtl -e -o testeQA/evidencias/relatorio-carga
```

Nao repita o comando acima com o mesmo diretorio de relatorio ja preenchido:
o JMeter exige diretorio de saida vazio ou inexistente para gerar o dashboard.

## 4. Evidencias e escopo

Salve prints do workflow e do Summary/Aggregate Report do JMeter em
`testeQA/evidencias/`. Para avaliacao, diferencie teste isolado/mock,
teste real de integracao e teste de carga. Se a API estiver indisponivel,
documente como BLOQUEADO por dependencia de configuracao.

Nao inclua `.venv/`, credenciais, tokens ou arquivos `.env` no Git.
No repositorio, acrescente a exclusao `testeQA/.venv/` em `.gitignore`
ou use `git add` explicitamente nos arquivos de QA que deseja publicar.
O workflow de Expo EAS/APK nao foi incluido: ele depende da conta EAS,
configuracao do frontend e `EXPO_TOKEN`.
