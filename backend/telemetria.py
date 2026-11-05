
import json
import os

import paho.mqtt.client as mqtt

from aplicativo import LeituraEntrada, registrar_leitura

endereco_broker = os.getenv("MQTT_BROKER", "broker.hivemq.com")
porta_broker = int(os.getenv("MQTT_PORTA", "1883"))
topico = os.getenv("MQTT_TOPICO", "houseenergy/leituras")

cliente_mqtt = None


def ao_conectar(cliente, dados, sinalizadores, motivo, propriedades):
    if motivo == 0:
        print("Conectado ao broker MQTT.")
        cliente.subscribe(topico)
        print(f"Inscrito no tópico: {topico}")
    else:
        print(f"Falha na conexão MQTT: {motivo}")


def ao_receber(cliente, dados, mensagem):
    try:
        conteudo = json.loads(mensagem.payload.decode("utf-8"))
        conteudo["origem"] = "mqtt"

        leitura = LeituraEntrada(**conteudo)
        registro = registrar_leitura(leitura)

        print("Leitura MQTT registrada no Supabase:", registro)

    except Exception as erro:
        print(f"Erro ao processar mensagem MQTT: {erro}")


def iniciar_consumidor():
    global cliente_mqtt

    if cliente_mqtt is not None:
        if cliente_mqtt.is_connected():
            return

    cliente_mqtt = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2
    )

    cliente_mqtt.on_connect = ao_conectar
    cliente_mqtt.on_message = ao_receber

    cliente_mqtt.connect(
        endereco_broker,
        porta_broker,
        60
    )

    cliente_mqtt.loop_start()
