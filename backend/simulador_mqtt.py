import json
import os
import random
import time
from datetime import datetime

import paho.mqtt.publish as publicar


endereco_broker = os.getenv("MQTT_BROKER", "broker.hivemq.com")
porta_broker = int(os.getenv("MQTT_PORTA", "1883"))
topico = os.getenv("MQTT_TOPICO", "houseenergy/leituras")
intervalo_segundos = int(os.getenv("MQTT_INTERVALO", "10"))

dias_simulados = 30
minutos_simulados_por_ciclo = 10
ciclos_por_dia = 24 * 60 // minutos_simulados_por_ciclo
ciclos_mensais = dias_simulados * ciclos_por_dia

eletrodomesticos = [
    {
        "nome": "Geladeira",
        "consumo_mensal_kwh": 45,
        "valor_kwh": 0.78938,
    },
    {
        "nome": "Televisão",
        "consumo_mensal_kwh": 12,
        "valor_kwh": 0.78938,
    },
    {
        "nome": "Ar-condicionado",
        "consumo_mensal_kwh": 60,
        "valor_kwh": 0.78938,
    },
    {
        "nome": "Máquina de lavar",
        "consumo_mensal_kwh": 8,
        "valor_kwh": 0.78938,
    },
    {
        "nome": "Chuveiro elétrico",
        "consumo_mensal_kwh": 55,
        "valor_kwh": 0.78938,
    },
]


def gerar_leitura(eletrodomestico):
    consumo_base = eletrodomestico["consumo_mensal_kwh"] / ciclos_mensais
    variacao = random.uniform(0.7, 1.3)
    consumo = round(consumo_base * variacao, 5)

    return {
        "eletrodomestico": eletrodomestico["nome"],
        "consumo_kwh": consumo,
        "valor_kwh": eletrodomestico["valor_kwh"],
    }


def publicar_leitura(leitura):
    mensagem = json.dumps(leitura, ensure_ascii=False)

    publicar.single(
        topic=topico,
        payload=mensagem,
        hostname=endereco_broker,
        port=porta_broker,
    )

    horario = datetime.now().strftime("%H:%M:%S")
    print(
        f"[{horario}] {leitura['eletrodomestico']}: "
        f"{leitura['consumo_kwh']} kWh"
    )


def iniciar_simulacao():
    print("Simulador MQTT do HouseEnergy AI iniciado.")
    print(f"Broker: {endereco_broker}:{porta_broker}")
    print(f"Tópico: {topico}")
    print(f"Intervalo real: {intervalo_segundos} segundos")
    print(f"Cada ciclo representa {minutos_simulados_por_ciclo} minutos simulados.")
    print(f"Meta mensal total: {sum(item['consumo_mensal_kwh'] for item in eletrodomesticos)} kWh")
    print("Pressione Ctrl + C para encerrar.\n")

    try:
        while True:
            for eletrodomestico in eletrodomesticos:
                leitura = gerar_leitura(eletrodomestico)

                try:
                    publicar_leitura(leitura)
                except Exception as erro:
                    print(
                        f"Falha ao publicar leitura de "
                        f"{eletrodomestico['nome']}: {erro}"
                    )

            print("\nCiclo concluído. Aguardando próximo ciclo...\n")
            time.sleep(intervalo_segundos)

    except KeyboardInterrupt:
        print("\nSimulador MQTT encerrado pelo usuário.")


if __name__ == "__main__":
    iniciar_simulacao()
