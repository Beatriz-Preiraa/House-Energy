const enderecoPadrao = "http://127.0.0.1:8000";
export const enderecoApi = process.env.EXPO_PUBLIC_ENDERECO_API || enderecoPadrao;

export type DadosResumo = {
  consumo_total_kwh: number;
  custo_total_reais: number;
  quantidade_leituras: number;
  quantidade_anomalias: number;
};

export type Previsao = {
  media_diaria_kwh: number;
  consumo_estimado_mes_kwh: number;
  custo_estimado_mes_reais: number;
  dias_restantes: number;
  metodo: string;
};

export type Leitura = {
  identificador: number;
  eletrodomestico: string;
  consumo_kwh: number;
  valor_kwh: number;
  origem: string;
  data_hora: string;
  custo_estimado: number;
  anomalia: boolean;
};

export async function buscarDados<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${enderecoApi}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Falha na API: ${resposta.status}`);
  }
  return resposta.json() as Promise<T>;
}
