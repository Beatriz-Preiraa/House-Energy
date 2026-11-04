import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { buscarDados, DadosResumo, Leitura, Previsao } from "../servicos/api";

const resumoDemonstrativo: DadosResumo = {
  consumo_total_kwh: 18.64,
  custo_total_reais: 17.15,
  quantidade_leituras: 12,
  quantidade_anomalias: 1
};

const previsaoDemonstrativa: Previsao = {
  media_diaria_kwh: 6.21,
  consumo_estimado_mes_kwh: 192.51,
  custo_estimado_mes_reais: 177.11,
  dias_restantes: 28,
  metodo: "estimativa demonstrativa"
};

const leiturasDemonstrativas: Leitura[] = [
  { identificador: 1, eletrodomestico: "Geladeira", consumo_kwh: 0.18, valor_kwh: 0.92, origem: "simulador", data_hora: new Date().toISOString(), custo_estimado: 0.17, anomalia: false },
  { identificador: 2, eletrodomestico: "Chuveiro", consumo_kwh: 1.1, valor_kwh: 0.92, origem: "simulador", data_hora: new Date().toISOString(), custo_estimado: 1.01, anomalia: true },
  { identificador: 3, eletrodomestico: "Televisão", consumo_kwh: 0.09, valor_kwh: 0.92, origem: "simulador", data_hora: new Date().toISOString(), custo_estimado: 0.08, anomalia: false }
];

export default function TelaInicial() {
  const [resumo, definirResumo] = useState<DadosResumo>(resumoDemonstrativo);
  const [previsao, definirPrevisao] = useState<Previsao>(previsaoDemonstrativa);
  const [leituras, definirLeituras] = useState<Leitura[]>(leiturasDemonstrativas);
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState("Exibindo dados demonstrativos.");

  const atualizarPainel = useCallback(async () => {
    definirCarregando(true);
    try {
      const [dadosResumo, dadosPrevisao, dadosLeituras] = await Promise.all([
        buscarDados<DadosResumo>("/resumo"),
        buscarDados<Previsao>("/previsao"),
        buscarDados<Leitura[]>("/leituras")
      ]);
      definirResumo(dadosResumo);
      definirPrevisao(dadosPrevisao);
      definirLeituras(dadosLeituras);
      definirErro("");
    } catch {
      definirErro("API indisponível. Mostrando dados demonstrativos. Inicie o backend para carregar dados reais.");
    } finally {
      definirCarregando(false);
    }
  }, []);

  useEffect(() => {
    const endereco = process.env.EXPO_PUBLIC_ENDERECO_API;
    if (endereco) {
      atualizarPainel();
    }
  }, [atualizarPainel]);

  return (
    <ScrollView style={estilos.pagina} contentContainerStyle={estilos.conteudo} refreshControl={<RefreshControl refreshing={carregando} onRefresh={atualizarPainel} />}>
      <Text style={estilos.marca}>HouseEnergy AI</Text>
      <Text style={estilos.titulo}>Consumo residencial</Text>
      <Text style={estilos.subtitulo}>Acompanhe o consumo e os gastos de energia da sua casa.</Text>
      {erro ? <Text style={estilos.aviso}>{erro}</Text> : null}
      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Consumo registrado</Text>
        <Text style={estilos.valor}>{resumo.consumo_total_kwh.toFixed(2)} kWh</Text>
      </View>
      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Custo registrado</Text>
        <Text style={estilos.valor}>R$ {resumo.custo_total_reais.toFixed(2)}</Text>
      </View>
      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Previsão de custo mensal</Text>
        <Text style={estilos.valor}>R$ {previsao.custo_estimado_mes_reais.toFixed(2)}</Text>
        <Text style={estilos.detalhe}>{previsao.consumo_estimado_mes_kwh.toFixed(2)} kWh estimados</Text>
      </View>
      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>Alertas de consumo</Text>
        <Text style={estilos.valor}>{resumo.quantidade_anomalias}</Text>
        <Text style={estilos.detalhe}>Leituras fora do padrão identificado.</Text>
      </View>
      <View style={estilos.cabecalhoLista}>
        <Text style={estilos.secao}>Últimas leituras</Text>
        {carregando ? <ActivityIndicator /> : null}
      </View>
      {leituras.slice(0, 8).map((leitura) => (
        <View style={estilos.linha} key={leitura.identificador}>
          <View style={estilos.textoLinha}>
            <Text style={estilos.aparelho}>{leitura.eletrodomestico}</Text>
            <Text style={estilos.detalhe}>{new Date(leitura.data_hora).toLocaleString("pt-BR")}</Text>
          </View>
          <View>
            <Text style={estilos.consumo}>{leitura.consumo_kwh.toFixed(2)} kWh</Text>
            {leitura.anomalia ? <Text style={estilos.alerta}>Verificar consumo</Text> : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: "#F2F6F3" },
  conteudo: { padding: 20, paddingTop: 28, gap: 12 },
  marca: { color: "#32805B", fontWeight: "700", fontSize: 14, letterSpacing: 1 },
  titulo: { fontSize: 28, fontWeight: "700", color: "#173D2C" },
  subtitulo: { fontSize: 15, color: "#53635A", marginBottom: 8 },
  cartao: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 18, gap: 7, elevation: 1 },
  rotulo: { fontSize: 14, color: "#53635A" },
  valor: { fontSize: 25, fontWeight: "700", color: "#173D2C" },
  detalhe: { fontSize: 12, color: "#69776F" },
  secao: { fontSize: 20, fontWeight: "700", color: "#173D2C", marginTop: 12 },
  cabecalhoLista: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  linha: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  textoLinha: { flex: 1, gap: 4 },
  aparelho: { fontSize: 15, fontWeight: "600", color: "#26372D" },
  consumo: { fontSize: 14, fontWeight: "600", color: "#173D2C", textAlign: "right" },
  alerta: { color: "#B45309", fontSize: 12, textAlign: "right" },
  aviso: { color: "#72551A", backgroundColor: "#FFF2CC", borderRadius: 10, padding: 12 }
});
