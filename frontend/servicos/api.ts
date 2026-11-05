const enderecoPadrao = "http://127.0.0.1:8000";

export const enderecoApi =
  process.env.EXPO_PUBLIC_ENDERECO_API || enderecoPadrao;

export type DadosResumo = {
  consumo_total_kwh: number;
  custo_total_reais: number;
  quantidade_leituras: number;
  quantidade_anomalias: number;
  quantidade_normais: number;
  quantidade_sem_analise: number;
};

export type Previsao = {
  consumo_medio_diario_kwh: number;
  consumo_estimado_mes_kwh: number;
  custo_estimado_mes_reais: number;
  quantidade_dias_analisados: number;
  dias_restantes: number;
  metodo: string;
};

export type Leitura = {
  identificador: string | number;
  eletrodomestico: string;
  consumo_kwh: number;
  valor_kwh: number;
  origem: string;
  data_hora: string;
  custo_estimado: number;
  anomalia: boolean | null;
};

export type EstadoSaude = {
  estado: string;
  leituras_registradas: number;
};

async function requisitar<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${enderecoApi}${caminho}`);

  if (!resposta.ok) {
    let detalhe = `Erro ${resposta.status}`;

    try {
      const corpo = await resposta.json();
      detalhe = corpo.detail || detalhe;
    } catch {
      detalhe = `Erro ${resposta.status}`;
    }

    throw new Error(detalhe);
  }

  return resposta.json() as Promise<T>;
}

export function buscarResumo() {
  return requisitar<DadosResumo>("/resumo");
}

export function buscarLeituras() {
  return requisitar<Leitura[]>("/leituras");
}

export function buscarPrevisao() {
  return requisitar<Previsao>("/previsao");
}

export function verificarApi() {
  return requisitar<EstadoSaude>("/saude");
}
