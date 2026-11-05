# Integração do aplicativo com a API

O aplicativo consulta as rotas `GET /resumo`, `GET /leituras`, `GET /previsao` e `GET /saude`.

Os dados do painel são atualizados automaticamente a cada 10 segundos. Também é possível atualizar manualmente puxando a tela para baixo.

## Configurar o endereço da API

O endereço padrão `http://127.0.0.1:8000` funciona quando o aplicativo é executado no mesmo computador, por exemplo no navegador.

Para testar em um celular físico, crie o arquivo `.env` nesta pasta e configure o IP local do computador:

```env
EXPO_PUBLIC_ENDERECO_API=http://IP_DO_COMPUTADOR:8000
```

O computador e o celular precisam estar na mesma rede Wi-Fi. O firewall do Windows também precisa permitir a porta 8000.

Para Android Emulator, use `http://10.0.2.2:8000`.

## Executar

Na pasta `frontend`:

```powershell
npm install
npx expo start
```

Mantenha o backend ativo. Para permitir acesso pela rede local, inicie-o com:

```powershell
python -m uvicorn aplicativo:api --reload --host 0.0.0.0
```

## Observação sobre a previsão

A API exige leituras em pelo menos duas datas distintas. Enquanto esse histórico não existir, a tela informa que a previsão está indisponível e continua mostrando o restante dos dados.
