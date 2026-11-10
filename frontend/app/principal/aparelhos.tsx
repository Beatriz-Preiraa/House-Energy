import { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usarDados } from "../../contextos/DadosContexto";
import { usarTema } from "../../contextos/TemaContexto";

export default function TelaAparelhos() {
  const { temaAtual } = usarTema();
  const { leituras, erroLeituras, carregando, atualizar } = usarDados();
  const estilos = criarEstilos(temaAtual);

  const aparelhos = useMemo(() => {
    const agrupados = new Map<
      string,
      {
        consumo: number;
        custo: number;
        quantidade: number;
        ultimaLeitura: string;
        anomalias: number;
      }
    >();

    leituras.forEach((leitura) => {
      const atual = agrupados.get(leitura.eletrodomestico) || {
        consumo: 0,
        custo: 0,
        quantidade: 0,
        ultimaLeitura: leitura.data_hora,
        anomalias: 0,
      };

      atual.consumo += leitura.consumo_kwh;
      atual.custo += leitura.custo_estimado;
      atual.quantidade += 1;
      if (new Date(leitura.data_hora) > new Date(atual.ultimaLeitura)) {
        atual.ultimaLeitura = leitura.data_hora;
      }
      if (leitura.anomalia === true) atual.anomalias += 1;

      agrupados.set(leitura.eletrodomestico, atual);
    });

    return Array.from(agrupados.entries())
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.consumo - a.consumo);
  }, [leituras]);

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
            name="bulb-outline"
            size={27}
            color={temaAtual.textoRoxo}
          />

          <Text style={estilos.titulo}>Eletrodomésticos</Text>
        </View>

        <Text style={estilos.subtitulo}>
          Aparelhos identificados nas leituras recebidas
        </Text>
      </View>

      <View style={estilos.resumo}>
        <Text style={estilos.rotulo}>Aparelhos com registros</Text>
        <Text style={estilos.valor}>{aparelhos.length}</Text>
      </View>

      {carregando && aparelhos.length === 0 ? (
        <ActivityIndicator color={temaAtual.verde} />
      ) : null}

      {aparelhos.map((aparelho) => (
        <View key={aparelho.nome} style={estilos.cartao}>
          <View style={estilos.linha}>
            <View style={estilos.informacao}>
              <Text style={estilos.nome}>{aparelho.nome}</Text>
              <Text style={estilos.detalhe}>
                {aparelho.quantidade} leituras registradas
              </Text>
            </View>
            <View style={estilos.valores}>
              <Text style={estilos.consumo}>
                {aparelho.consumo.toFixed(3)} kWh
              </Text>
              <Text style={estilos.detalhe}>Consumo acumulado</Text>
            </View>
          </View>

          <View style={estilos.divisor} />

          <View style={estilos.linha}>
            <View>
              <Text style={estilos.detalhe}>Custo acumulado</Text>
              <Text style={estilos.valorSecundario}>
                {aparelho.custo.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
            <View>
              <Text style={estilos.detalhe}>Alertas</Text>
              <Text style={estilos.valorSecundario}>{aparelho.anomalias}</Text>
            </View>
          </View>

          <Text style={estilos.detalhe}>
            Última leitura:{" "}
            {new Date(aparelho.ultimaLeitura).toLocaleString("pt-BR")}
          </Text>
        </View>
      ))}

      {!carregando && aparelhos.length === 0 ? (
        <Text style={estilos.mensagem}>
          {erroLeituras || "Nenhum eletrodoméstico possui leituras registradas."}
        </Text>
      ) : null}

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
    resumo: {
      backgroundColor: tema.roxo,
      borderRadius: 18,
      padding: 18,
      gap: 6,
    },
    rotulo: { color: tema.textoRoxo, fontSize: 13 },
    valor: { color: tema.texto, fontSize: 28, fontWeight: "700" },
    cartao: {
      backgroundColor: tema.cartao,
      borderRadius: 16,
      padding: 17,
      gap: 13,
    },
    linha: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    informacao: { flex: 1, gap: 5 },
    valores: { alignItems: "flex-end", gap: 5 },
    nome: { color: tema.texto, fontSize: 16, fontWeight: "700" },
    consumo: { color: tema.texto, fontSize: 17, fontWeight: "700" },
    detalhe: { color: tema.textoSecundario, fontSize: 11 },
    divisor: { height: 1, backgroundColor: tema.fundo },
    valorSecundario: { color: tema.texto, fontSize: 15, fontWeight: "600", marginTop: 4 },
    mensagem: { color: tema.textoSecundario, fontSize: 13, paddingVertical: 15 },
    erro: { color: tema.alertaTexto, fontSize: 12 },
  });
}
