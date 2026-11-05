# HouseEnergy AI — divisão por integrante

Cada pasta corresponde à responsabilidade de um integrante. Os módulos foram preparados para serem desenvolvidos separadamente e depois integrados no repositório do grupo.

## Integrante 1 — aplicativo

Entre em `integrante-1-aplicativo`.

1. Instale Node.js 20 ou superior.
2. Execute `npm install`.
3. Execute `npm run start`.
4. Abra o projeto no Expo Go ou emulador Android.

A tela usa dados demonstrativos para que possa ser testada sem depender do backend. Para integrar com a API, ajuste `servicos/api.ts` e defina `EXPO_PUBLIC_ENDERECO_API`.

## Integrante 2 — backend, MQTT e IA

Entre em `integrante-2-backend`.

1. Crie e ative um ambiente virtual Python.
2. Execute `pip install -r requisitos.txt`.
3. Execute `uvicorn aplicativo:api --reload`.
4. Acesse `http://127.0.0.1:8000/docs`.

Para testar sem broker MQTT, envie leituras pelo endpoint `POST /leituras` ou use `POST /simular`. Para testar MQTT, configure as variáveis `MQTT_BROKER`, `MQTT_PORTA` e `MQTT_TOPICO`, depois inicie o consumidor pelo endpoint `POST /mqtt/iniciar`.

Os registros estão em memória e serão perdidos quando a API reiniciar. O armazenamento persistente deve ser adicionado na etapa de integração.

## Integrante 3 — QA e entrega

Entre em `integrante-3-qa`.

- `testes/testes_api.py`: testes iniciais de contrato da API.
- `jmeter/carga_api.jmx`: teste de carga dos endpoints de consulta.
- `.github/workflows/validacao.yml`: testes Python e validação do aplicativo.

O fluxo de CI executa testes e valida a instalação do aplicativo. A compilação APK está em um workflow separado e precisa de um projeto Expo EAS configurado e do segredo `EXPO_TOKEN`.

## Integração no repositório do grupo

A sugestão é copiar o conteúdo das três pastas para pastas equivalentes em um único repositório. Combinem a URL da API e o contrato dos endpoints antes de integrar.

O projeto é uma base acadêmica de desenvolvimento. Antes de apresentar como versão final, implementem autenticação real, persistência de dados, testes ampliados e validação do modelo de previsão com dados representativos.
