
from datetime import datetime, timezone
from typing import Literal
import calendar

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression

from banco import banco_dados

api = FastAPI(title="HouseEnergy AI", version="1.0.0")




class LeituraEntrada(BaseModel):
    eletrodomestico: str = Field(min_length=2, max_length=80)
    consumo_kwh: float = Field(gt=0, le=1000)
    valor_kwh: float = Field(gt=0, le=100)
    origem: Literal["aplicativo", "mqtt", "simulador"] = "aplicativo"



def detectar_anomalia(eletrodomestico_id, consumo_atual):
    resposta = (
        banco_dados
        .table("leituras_consumo")
        .select("consumo_kwh")
        .eq("eletrodomestico_id", eletrodomestico_id)
        .order("data_hora", desc=True)
        .limit(100)
        .execute()
    )

    historico = [
        float(registro["consumo_kwh"])
        for registro in resposta.data
    ]

    if len(historico) < 10:
        return None

    modelo = IsolationForest(
        contamination=0.10,
        random_state=42
    )

    dados_treinamento = np.array(historico).reshape(-1, 1)

    modelo.fit(dados_treinamento)

    resultado = modelo.predict(
        np.array([[consumo_atual]])
    )

    return bool(resultado[0] == -1)



def buscar_eletrodomestico(nome):
    resposta = (
        banco_dados
        .table("eletrodomesticos")
        .select("id")
        .eq("nome", nome)
        .limit(1)
        .execute()
    )

    if resposta.data:
        return resposta.data[0]["id"]

    resposta = (
        banco_dados
        .table("eletrodomesticos")
        .insert({"nome": nome})
        .execute()
    )

    return resposta.data[0]["id"]


def registrar_leitura(dados: LeituraEntrada):
    try:
        identificador_eletrodomestico = buscar_eletrodomestico(
            dados.eletrodomestico
        )

        anomalia = detectar_anomalia(
            identificador_eletrodomestico,
            dados.consumo_kwh
        )
   
        registro = {
            "eletrodomestico_id": identificador_eletrodomestico,
            "consumo_kwh": dados.consumo_kwh,
            "valor_kwh": dados.valor_kwh,
            "custo_reais": round(
                dados.consumo_kwh * dados.valor_kwh, 2
            ),
            "origem": dados.origem,
            "anomalia": anomalia,
            "data_hora": datetime.now(timezone.utc).isoformat()
        }

        resposta = (
            banco_dados
            .table("leituras_consumo")
            .insert(registro)
            .execute()
        )

        leitura = resposta.data[0]

        return {
            "identificador": leitura["id"],
            "eletrodomestico": dados.eletrodomestico,
            "consumo_kwh": leitura["consumo_kwh"],
            "valor_kwh": leitura["valor_kwh"],
            "origem": leitura["origem"],
            "data_hora": leitura["data_hora"],
            "custo_estimado": leitura["custo_reais"],
            "anomalia": leitura["anomalia"]
        }

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao registrar leitura: {erro}"
        ) from erro


def consultar_leituras():
    resposta = (
        banco_dados
        .table("leituras_consumo")
        .select("*, eletrodomesticos(nome)")
        .order("data_hora", desc=True)
        .execute()
    )

    registros = []

    for leitura in resposta.data:
        eletrodomestico = leitura.get("eletrodomesticos") or {}

        registros.append({
            "identificador": leitura["id"],
            "eletrodomestico": eletrodomestico.get("nome"),
            "consumo_kwh": leitura["consumo_kwh"],
            "valor_kwh": leitura["valor_kwh"],
            "origem": leitura["origem"],
            "data_hora": leitura["data_hora"],
            "custo_estimado": leitura["custo_reais"],
            "anomalia": leitura["anomalia"]
        })

    return registros


@api.get("/")
def inicio():
    return {
        "mensagem": "API HouseEnergy AI",
        "estado": "ativa"
    }


@api.get("/saude")
def saude():
    try:
        registros = consultar_leituras()

        return {
            "estado": "ativa",
            "leituras_registradas": len(registros)
        }

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao consultar banco de dados: {erro}"
        ) from erro


@api.post("/leituras")
def criar_leitura(dados: LeituraEntrada):
    return registrar_leitura(dados)


@api.get("/leituras")
def listar_leituras():
    try:
        return consultar_leituras()

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar leituras: {erro}"
        ) from erro



@api.get("/resumo")
def obter_resumo():
    try:
        registros = consultar_leituras()

        return {
            "consumo_total_kwh": round(
                sum(item["consumo_kwh"] for item in registros), 3
            ),
            "custo_total_reais": round(
                sum(item["custo_estimado"] for item in registros), 2
            ),
            "quantidade_leituras": len(registros),
            "quantidade_anomalias": sum(
                1 for item in registros if item["anomalia"] is True
            ),
            "quantidade_normais": sum(
                1 for item in registros if item["anomalia"] is False
            ),
            "quantidade_sem_analise": sum(
                1 for item in registros if item["anomalia"] is None
            )
        }

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar resumo: {erro}"
        ) from erro



@api.get("/previsao")
def obter_previsao():
    try:
        registros = consultar_leituras()

        if not registros:
            raise HTTPException(
                status_code=400,
                detail="Registre leituras antes de solicitar a previsão."
            )

        leituras_por_dia = {}

        for registro in registros:
            data = datetime.fromisoformat(
                registro["data_hora"].replace("Z", "+00:00")
            ).date()

            consumo = float(registro["consumo_kwh"])

            if data not in leituras_por_dia:
                leituras_por_dia[data] = 0

            leituras_por_dia[data] += consumo

        historico = sorted(leituras_por_dia.items())

        if len(historico) < 2:
            raise HTTPException(
                status_code=400,
                detail="São necessárias pelo menos duas datas de consumo para gerar a previsão."
            )

        datas = [item[0] for item in historico]
        consumos = [item[1] for item in historico]

        primeira_data = datas[0]

        dias = np.array([
            (data - primeira_data).days
            for data in datas
        ]).reshape(-1, 1)

        valores = np.array(consumos)

        modelo = LinearRegression()
        modelo.fit(dias, valores)

        hoje = datetime.now(timezone.utc).date()

        ultimo_dia = max(
            (hoje - primeira_data).days,
            0
        )

        dias_mes = calendar.monthrange(
            hoje.year,
            hoje.month
        )[1]

        inicio_mes = hoje.replace(day=1)

        dia_inicio = (inicio_mes - primeira_data).days

        previsao_diaria = []

        for dia in range(dia_inicio, dia_inicio + dias_mes):
            consumo_previsto = float(
                modelo.predict(np.array([[dia]]))[0]
            )

            previsao_diaria.append(
                max(0, consumo_previsto)
            )

        consumo_estimado = sum(previsao_diaria)

        tarifa_media = sum(
            float(item["valor_kwh"]) for item in registros
        ) / len(registros)

        media_diaria = sum(consumos) / len(consumos)

        return {
            "consumo_medio_diario_kwh": round(media_diaria, 3),
            "consumo_estimado_mes_kwh": round(
                consumo_estimado, 2
            ),
            "custo_estimado_mes_reais": round(
                consumo_estimado * tarifa_media, 2
            ),
            "quantidade_dias_analisados": len(historico),
            "dias_restantes": max(dias_mes - hoje.day, 0),
            "metodo": "regressão linear baseada no histórico diário"
        }

    except HTTPException:
        raise

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao gerar previsão: {erro}"
        ) from erro



@api.post("/simular")
def simular_leituras():
    gerador = np.random.default_rng()

    aparelhos = [
        "Geladeira",
        "Chuveiro",
        "Ar-condicionado",
        "Televisão",
        "Máquina de lavar"
    ]

    registros = []

    for aparelho in aparelhos:
        consumo = round(
            float(gerador.uniform(0.05, 1.2)), 3
        )

        leitura = LeituraEntrada(
            eletrodomestico=aparelho,
            consumo_kwh=consumo,
            valor_kwh=0.92,
            origem="simulador"
        )

        registros.append(registrar_leitura(leitura))

    return {
        "quantidade_criada": len(registros),
        "leituras": registros
    }


@api.post("/mqtt/iniciar")
def iniciar_mqtt():
    try:
        from telemetria import iniciar_consumidor
        iniciar_consumidor()

    except Exception as erro:
        raise HTTPException(
            status_code=500,
            detail=f"Não foi possível iniciar MQTT: {erro}"
        ) from erro

    return {"mensagem": "Consumidor MQTT iniciado"}
