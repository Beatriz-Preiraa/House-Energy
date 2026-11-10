import { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usarDados } from "../../contextos/DadosContexto";
import { usarTema } from "../../contextos/TemaContexto";
import { Ionicons } from "@expo/vector-icons";

export default function TelaConsumo() {
  const { temaAtual } = usarTema();
  const { resumo, leituras, erroResumo, erroLeituras, carregando, atualizar } =
    usarDados();
  const estilos = criarEstilos(temaAtual);

  const dias = useMemo(() => {
    const agrupados = new Map<string, { consumo: number; custo: number }>();

    leituras.forEach((leitura) => {
      const data = new Date(leitura.data_hora).toLocaleDateString("pt-BR");
      const atual = agrupados.get(data) || { consumo: 0, custo: 0 };
      atual.consumo += leitura.consumo_kwh;
      atual.custo += leitura.custo_estimado;
      agrupados.set(data, atual);
    });

    return Array.from(agrupados.entries())
      .map(([data, valores]) => ({ data, ...valores }))
      .slice(0, 14);
  }, [leituras]);

  const maiorConsumo = Math.max(...dias.map((dia) => dia.consumo), 0.01);

  return (
    <ScrollView
      style={estilos.pagina}
      contentContainerStyle={estilos.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={atualizar}
          tintColor={temaAtual.verde}
        />
      }
    >
      <View style={estilos.cabecalho}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            name="flash-outline"
            size={27}
            color={temaAtual.textoRoxo}
          />
          <Text style={estilos.titulo}>Consumo de energia</Text>
        </View>

        <Text style={estilos.subtitulo}>
          Histórico calculado a partir das leituras registradas
        </Text>
      </View>

      <View style={estilos.cartaoPrincipal}>
        <Text style={estilos.rotuloPrincipal}>Consumo acumulado</Text>
        <Text style={estilos.valorPrincipal}>
          {resumo ? `${resumo.consumo_total_kwh.toFixed(3)} kWh` : "—"}
        </Text>
        <Text style={estilos.detalhePrincipal}>
          Custo:{" "}
          {resumo
            ? resumo.custo_total_reais.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
            : "—"}
        </Text>
      </View>

      <View style={estilos.linhaCartoes}>
        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>Leituras</Text>
          <Text style={estilos.valor}>{resumo?.quantidade_leituras ?? "—"}</Text>
        </View>
        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>Anomalias</Text>
          <Text style={estilos.valor}>
            {resumo?.quantidade_anomalias ?? "—"}
          </Text>
        </View>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Consumo por dia registrado</Text>
        {dias.length ? (
          dias.map((dia) => (
            <View key={dia.data} style={estilos.itemDia}>
              <View style={estilos.linha}>
                <Text style={estilos.texto}>{dia.data}</Text>
                <Text style={estilos.valorDia}>
                  {dia.consumo.toFixed(3)} kWh
                </Text>
              </View>
              <View style={estilos.trilho}>
                <View
                  style={[
                    estilos.barra,
                    { width: `${(dia.consumo / maiorConsumo) * 100}%` },
                  ]}
                />
              </View>
              <Text style={estilos.detalhe}>
                Custo:{" "}
                {dia.custo.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
          ))
        ) : (
          <Text style={estilos.detalhe}>
            {erroLeituras || "Ainda não há histórico de consumo."}
          </Text>
        )}
      </View>

      {carregando ? <ActivityIndicator color={temaAtual.verde} /> : null}
      {erroResumo ? <Text style={estilos.erro}>{erroResumo}</Text> : null}
      {erroLeituras ? <Text style={estilos.erro}>{erroLeituras}</Text> : null}
    </ScrollView>
  );
}

function criarEstilos(tema: any) {
  return StyleSheet.create({
    pagina: { flex: 1, backgroundColor: tema.fundo },
    conteudo: { padding: 20, paddingTop: 35, paddingBottom: 30, gap: 15 },
    cabecalho: { gap: 5, marginBottom: 5 },
    titulo: { fontSize: 24, fontWeight: "700", color: tema.texto },
    subtitulo: { fontSize: 13, color: tema.textoSecundario },
    cartaoPrincipal: {
      backgroundColor: tema.roxo,
      borderRadius: 20,
      padding: 20,
      gap: 8,
    },
    rotuloPrincipal: { color: tema.textoRoxo, fontSize: 14 },
    valorPrincipal: { color: tema.texto, fontSize: 31, fontWeight: "700" },
    detalhePrincipal: { color: tema.textoRoxo, fontSize: 12 },
    linhaCartoes: { flexDirection: "row", gap: 12 },
    cartao: {
      flex: 1,
      backgroundColor: tema.cartao,
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    rotulo: { color: tema.textoSecundario, fontSize: 12 },
    valor: { color: tema.texto, fontSize: 23, fontWeight: "700" },
    tituloSecao: { color: tema.texto, fontSize: 17, fontWeight: "700" },
    itemDia: { gap: 7, paddingVertical: 8 },
    linha: { flexDirection: "row", justifyContent: "space-between" },
    texto: { color: tema.texto, fontSize: 13 },
    valorDia: { color: tema.texto, fontSize: 13, fontWeight: "700" },
    trilho: { height: 8, backgroundColor: tema.fundo, borderRadius: 8 },
    barra: { height: 8, backgroundColor: tema.verde, borderRadius: 8 },
    detalhe: { color: tema.textoSecundario, fontSize: 11 },
    erro: { color: tema.alertaTexto, fontSize: 12 },
  });
}
