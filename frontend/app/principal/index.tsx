import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usarDados } from "../../contextos/DadosContexto";
import { usarTema } from "../../contextos/TemaContexto";
import MedidorEnergia from "../../componentes/MedidorEnergia";
import { Ionicons } from "@expo/vector-icons";
const moeda = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function TelaInicial() {
  const { modoEscuro, definirModoEscuro, temaAtual } = usarTema();
  const {
    resumo,
    leituras,
    previsao,
    erroResumo,
    erroLeituras,
    erroPrevisao,
    carregando,
    atualizar,
  } = usarDados();

  const estilos = criarEstilos(temaAtual);

  const consumoPorAparelho = useMemo(() => {
    const agrupado = new Map<string, number>();

    leituras.forEach((leitura) => {
      agrupado.set(
        leitura.eletrodomestico,
        (agrupado.get(leitura.eletrodomestico) || 0) + leitura.consumo_kwh
      );
    });

    return Array.from(agrupado.entries())
      .map(([nome, consumo]) => ({ nome, consumo }))
      .sort((a, b) => b.consumo - a.consumo)
      .slice(0, 5);
  }, [leituras]);

  const maiorConsumo = Math.max(
    ...consumoPorAparelho.map((item) => item.consumo),
    0.01
  );

  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

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
        <View>
          <Text style={estilos.saudacao}>HouseEnergy AI</Text>
          <Text style={estilos.data}>{dataAtual}</Text>
        </View>
        <Pressable
          style={estilos.botaoTema}
          onPress={() => definirModoEscuro(!modoEscuro)}
          accessibilityRole="button"
          accessibilityLabel={
            modoEscuro ? "Ativar tema claro" : "Ativar tema escuro"
          }
        >
          <Ionicons
            name={modoEscuro ? "sunny" : "moon"}
            size={23}
            color={modoEscuro ? "#FFD98A" : "#292044"}
          />
        </Pressable>
      </View>

      {erroResumo ? (
        <View style={estilos.aviso}>
          <Text style={estilos.textoAviso}>
            Não foi possível carregar o resumo: {erroResumo}
          </Text>
        </View>
      ) : null}

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>
          Consumo total registrado
        </Text>

        {resumo ? (
          <MedidorEnergia
            valor={resumo.consumo_total_kwh}
            meta={60}
            corTexto={temaAtual.texto}
            corSecundaria={temaAtual.textoSecundario}
            corTrilho={temaAtual.fundo}
            corProgresso="#0878FF"
          />
        ) : (
          <ActivityIndicator color={temaAtual.textoRoxo} />
        )}

        <Text style={estilos.detalhe}>
          Dados atualizados automaticamente a cada 10 segundos
        </Text>
      </View>

      <View style={estilos.linhaCartoes}>
        <View style={estilos.cartaoEscuro}>
          <Text style={estilos.rotuloCartaoClaro}>Custo registrado</Text>
          <Text style={estilos.valorCartaoClaro}>
            {resumo ? moeda(resumo.custo_total_reais) : "—"}
          </Text>
        </View>
        <View style={estilos.cartaoVerde}>
          <Text style={estilos.rotuloCartaoClaro}>Alertas de consumo</Text>
          <Text style={estilos.valorCartaoClaro}>
            {resumo ? resumo.quantidade_anomalias : "—"}
          </Text>
        </View>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Consumo por aparelho</Text>
        {consumoPorAparelho.length ? (
          consumoPorAparelho.map((item) => (
            <View key={item.nome} style={estilos.itemGrafico}>
              <View style={estilos.linhaTexto}>
                <Text style={estilos.aparelho}>{item.nome}</Text>
                <Text style={estilos.valorLeitura}>
                  {item.consumo.toFixed(3)} kWh
                </Text>
              </View>
              <View style={estilos.trilho}>
                <View
                  style={[
                    estilos.barra,
                    { width: `${(item.consumo / maiorConsumo) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={estilos.detalhe}>
            {erroLeituras || "Ainda não existem leituras registradas."}
          </Text>
        )}
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Previsão mensal</Text>
        {previsao ? (
          <>
            <Text style={estilos.valorPrevisao}>
              {moeda(previsao.custo_estimado_mes_reais)}
            </Text>
            <Text style={estilos.detalhe}>
              {previsao.consumo_estimado_mes_kwh.toFixed(2)} kWh estimados
            </Text>
            <Text style={estilos.detalhe}>
              Baseada em {previsao.quantidade_dias_analisados} dias com histórico
            </Text>
          </>
        ) : (
          <Text style={estilos.detalhe}>
            {erroPrevisao || "Previsão ainda não disponível."}
          </Text>
        )}
      </View>

      <View style={estilos.cabecalhoLista}>
        <Text style={estilos.tituloSecao}>Últimas leituras</Text>
        {carregando ? (
          <ActivityIndicator color={temaAtual.verde} />
        ) : null}
      </View>

      {leituras.slice(0, 6).map((leitura) => (
        <View key={String(leitura.identificador)} style={estilos.linhaLeitura}>
          <View style={estilos.informacaoLeitura}>
            <Text style={estilos.aparelho}>{leitura.eletrodomestico}</Text>
            <Text style={estilos.detalhe}>
              {new Date(leitura.data_hora).toLocaleString("pt-BR")}
            </Text>
          </View>
          <View>
            <Text style={estilos.valorLeitura}>
              {leitura.consumo_kwh.toFixed(3)} kWh
            </Text>
            {leitura.anomalia === true ? (
              <Text style={estilos.alerta}>Consumo fora do padrão</Text>
            ) : null}
          </View>
        </View>
      ))}

      {erroLeituras ? (
        <Text style={estilos.textoErro}>{erroLeituras}</Text>
      ) : null}
    </ScrollView>
  );
}

function criarEstilos(tema: any) {
  return StyleSheet.create({
    pagina: { flex: 1, backgroundColor: tema.fundo },
    conteudo: { padding: 20, paddingTop: 35, paddingBottom: 30, gap: 16 },
    cabecalho: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    saudacao: { fontSize: 23, fontWeight: "700", color: tema.texto },
    data: { fontSize: 13, color: tema.textoSecundario, marginTop: 5 },
    
    botaoTema: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: tema.cartao,
      alignItems: "center",
      justifyContent: "center",
    },

    iconeTema: { fontSize: 12, fontWeight: "600", color: tema.texto },

    aviso: { backgroundColor: tema.alertaFundo, padding: 12, borderRadius: 10 },
    
    textoAviso: { color: tema.alertaTexto, fontSize: 12 },
    cartaoConsumo: {
      backgroundColor: tema.roxo,
      borderRadius: 22,
      padding: 20,
      gap: 10,
    },
    rotuloPrincipal: { fontSize: 15, fontWeight: "600", color: tema.textoRoxo },
    valorPrincipal: { fontSize: 32, fontWeight: "700", color: tema.texto },
    detalheRoxo: { fontSize: 11, color: tema.textoRoxo },
    linhaCartoes: { flexDirection: "row", gap: 12 },
    cartaoEscuro: {
      flex: 1,
      backgroundColor: tema.escuro,
      borderRadius: 17,
      padding: 16,
      gap: 10,
    },
    cartaoVerde: {
      flex: 1,
      backgroundColor: tema.verde,
      borderRadius: 17,
      padding: 16,
      gap: 10,
    },
    rotuloCartaoClaro: { color: "#FFFFFF", fontSize: 12 },
    valorCartaoClaro: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
    cartao: {
      backgroundColor: tema.cartao,
      borderRadius: 17,
      padding: 18,
      gap: 12,
    },
    tituloSecao: { fontSize: 18, fontWeight: "700", color: tema.texto },
    itemGrafico: { gap: 7 },
    linhaTexto: { flexDirection: "row", justifyContent: "space-between" },
    aparelho: { fontSize: 13, fontWeight: "600", color: tema.texto },
    trilho: { height: 8, backgroundColor: tema.fundo, borderRadius: 8 },
    barra: { height: 8, backgroundColor: tema.verde, borderRadius: 8 },
    valorPrevisao: { color: tema.texto, fontSize: 26, fontWeight: "700" },
    detalhe: { color: tema.textoSecundario, fontSize: 12 },
    cabecalhoLista: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 5,
    },
    linhaLeitura: {
      backgroundColor: tema.cartao,
      borderRadius: 14,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    informacaoLeitura: { flex: 1, gap: 5 },
    valorLeitura: { fontSize: 13, fontWeight: "700", color: tema.texto },
    alerta: {
      color: tema.alertaTexto,
      fontSize: 10,
      textAlign: "right",
      marginTop: 4,
    },
    textoErro: { color: tema.alertaTexto, fontSize: 12 },
  });
}
