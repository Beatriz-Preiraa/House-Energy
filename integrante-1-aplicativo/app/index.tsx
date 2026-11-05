
import { temaClaro, temaEscuro } from "../estilos/temas";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import {
  buscarDados,
  DadosResumo,
  Leitura,
  Previsao
} from "../servicos/api";

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
  {
    identificador: 1,
    eletrodomestico: "Geladeira",
    consumo_kwh: 0.18,
    valor_kwh: 0.92,
    origem: "simulador",
    data_hora: new Date().toISOString(),
    custo_estimado: 0.17,
    anomalia: false
  },
  {
    identificador: 2,
    eletrodomestico: "Chuveiro",
    consumo_kwh: 1.1,
    valor_kwh: 0.92,
    origem: "simulador",
    data_hora: new Date().toISOString(),
    custo_estimado: 1.01,
    anomalia: true
  },
  {
    identificador: 3,
    eletrodomestico: "Televisão",
    consumo_kwh: 0.09,
    valor_kwh: 0.92,
    origem: "simulador",
    data_hora: new Date().toISOString(),
    custo_estimado: 0.08,
    anomalia: false
  }
];

export default function TelaInicial() {
  const [modoEscuro, definirModoEscuro] = useState(false);

  const temaAtual = modoEscuro ? temaEscuro : temaClaro;
  const estilos = criarEstilos(temaAtual);

  const [resumo, definirResumo] = useState<DadosResumo>(
    resumoDemonstrativo
  );

  const [previsao, definirPrevisao] = useState<Previsao>(
    previsaoDemonstrativa
  );

  const [leituras, definirLeituras] = useState<Leitura[]>(
    leiturasDemonstrativas
  );

  const [carregando, definirCarregando] = useState(false);

  const [erro, definirErro] = useState(
    "Exibindo dados demonstrativos."
  );

  const atualizarPainel = useCallback(async () => {
    definirCarregando(true);

    try {
      const [dadosResumo, dadosPrevisao, dadosLeituras] =
        await Promise.all([
          buscarDados<DadosResumo>("/resumo"),
          buscarDados<Previsao>("/previsao"),
          buscarDados<Leitura[]>("/leituras")
        ]);

      definirResumo(dadosResumo);
      definirPrevisao(dadosPrevisao);
      definirLeituras(dadosLeituras);
      definirErro("");
    } catch {
      definirErro(
        "API indisponível. Exibindo dados demonstrativos."
      );
    } finally {
      definirCarregando(false);
    }
  }, []);

  useEffect(() => {
    atualizarPainel();
  }, [atualizarPainel]);

  const maiorConsumo = Math.max(
    ...leituras.map((leitura) => leitura.consumo_kwh),
    1
  );

  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  });

  return (
    <ScrollView
      style={estilos.pagina}
      contentContainerStyle={estilos.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={carregando}
          onRefresh={atualizarPainel}
          tintColor={temaAtual.verde}
        />
      }
    >
      <View style={estilos.cabecalho}>
        <View>
          <Text style={estilos.saudacao}>
            Olá, seja bem-vinda!
          </Text>

          <Text style={estilos.data}>
            {dataAtual}
          </Text>
        </View>

        <Pressable
          style={estilos.botaoTema}
          onPress={() => definirModoEscuro(!modoEscuro)}
          accessibilityRole="button"
          accessibilityLabel={
            modoEscuro
              ? "Ativar modo claro"
              : "Ativar modo escuro"
          }
        >
          <Text style={estilos.iconeTema}>
            {modoEscuro ? "☀" : "☾"}
          </Text>
        </Pressable>
      </View>

      {erro ? (
        <Text style={estilos.aviso}>
          {erro}
        </Text>
      ) : null}

      <View style={estilos.cartaoConsumo}>
        <View style={estilos.linha}>
          <Text style={estilos.rotuloPrincipal}>
            Consumo total de energia
          </Text>

          <Text style={estilos.iconeRaio}>
            ϟ
          </Text>
        </View>

        <Text style={estilos.valorPrincipal}>
          {resumo.consumo_total_kwh.toFixed(2)} kWh
        </Text>

        <Text style={estilos.detalheRoxo}>
          Consumo registrado
        </Text>

        <Text style={estilos.tituloGrafico}>
          Consumo por aparelho
        </Text>

        <View style={estilos.grafico}>
          {leituras.slice(0, 6).map((leitura) => {
            const altura = Math.max(
              12,
              (leitura.consumo_kwh / maiorConsumo) * 105
            );

            return (
              <View
                key={leitura.identificador}
                style={estilos.colunaGrafico}
              >
                <View
                  style={[
                    estilos.barraGrafico,
                    { height: altura }
                  ]}
                />

                <Text style={estilos.textoGrafico}>
                  {leitura.eletrodomestico}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={estilos.linhaCartoes}>
        <View style={estilos.cartaoEscuro}>
          <Text style={estilos.rotuloCartaoClaro}>
            Custo registrado
          </Text>

          <Text style={estilos.valorCartaoClaro}>
            R$ {resumo.custo_total_reais.toFixed(2)}
          </Text>
        </View>

        <View style={estilos.cartaoVerde}>
          <Text style={estilos.rotuloCartaoClaro}>
            Alertas de consumo
          </Text>

          <Text style={estilos.valorCartaoClaro}>
            {resumo.quantidade_anomalias}
          </Text>
        </View>
      </View>

      <View style={estilos.cartaoPrevisao}>
        <Text style={estilos.rotulo}>
          Previsão de custo mensal
        </Text>

        <Text style={estilos.valorPrevisao}>
          R$ {previsao.custo_estimado_mes_reais.toFixed(2)}
        </Text>

        <Text style={estilos.detalhe}>
          {previsao.consumo_estimado_mes_kwh.toFixed(2)} kWh estimados
        </Text>
      </View>

      <View style={estilos.cabecalhoLista}>
        <Text style={estilos.tituloSecao}>
          Últimas leituras
        </Text>

        {carregando ? (
          <ActivityIndicator color={temaAtual.verde} />
        ) : null}
      </View>

      {leituras.slice(0, 8).map((leitura) => (
        <View
          key={leitura.identificador}
          style={estilos.linhaLeitura}
        >
          <View style={estilos.informacaoLeitura}>
            <Text style={estilos.aparelho}>
              {leitura.eletrodomestico}
            </Text>

            <Text style={estilos.detalhe}>
              {new Date(leitura.data_hora).toLocaleString("pt-BR")}
            </Text>
          </View>

          <View>
            <Text style={estilos.valorLeitura}>
              {leitura.consumo_kwh.toFixed(2)} kWh
            </Text>

            {leitura.anomalia ? (
              <Text style={estilos.alerta}>
                Verificar consumo
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function criarEstilos(tema: typeof temaClaro) {
  return StyleSheet.create({
    pagina: {
      flex: 1,
      backgroundColor: tema.fundo
    },

    conteudo: {
      padding: 20,
      paddingTop: 35,
      gap: 16
    },

    cabecalho: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },

    saudacao: {
      fontSize: 23,
      fontWeight: "700",
      color: tema.texto
    },

    data: {
      fontSize: 13,
      color: tema.textoSecundario,
      marginTop: 5
    },

    botaoTema: {
      padding: 10,
      borderRadius: 12,
      backgroundColor: tema.cartao,
      alignItems: "center",
      justifyContent: "center"
    },

    iconeTema: {
      fontSize: 25,
      color: tema.texto
    },

    aviso: {
      backgroundColor: tema.alertaFundo,
      color: tema.alertaTexto,
      padding: 12,
      borderRadius: 10,
      fontSize: 12
    },

    cartaoConsumo: {
      backgroundColor: tema.roxo,
      borderRadius: 22,
      padding: 20,
      gap: 10
    },

    linha: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },

    rotuloPrincipal: {
      fontSize: 16,
      fontWeight: "600",
      color: tema.textoRoxo
    },

    iconeRaio: {
      fontSize: 32,
      color: tema.texto
    },

    valorPrincipal: {
      fontSize: 31,
      fontWeight: "700",
      color: tema.texto
    },

    detalheRoxo: {
      fontSize: 12,
      color: tema.textoRoxo
    },

    tituloGrafico: {
      fontSize: 14,
      fontWeight: "600",
      color: tema.textoRoxo,
      marginTop: 8
    },

    grafico: {
      backgroundColor: tema.cartao,
      borderRadius: 15,
      padding: 15,
      marginTop: 8,
      height: 145,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "flex-end"
    },

    colunaGrafico: {
      alignItems: "center",
      justifyContent: "flex-end",
      flex: 1,
      height: "100%",
      gap: 5
    },

    barraGrafico: {
      width: 22,
      maxHeight: 105,
      backgroundColor: tema.verde,
      borderRadius: 10
    },

    textoGrafico: {
      fontSize: 9,
      color: tema.textoSecundario
    },

    linhaCartoes: {
      flexDirection: "row",
      gap: 12
    },

    cartaoEscuro: {
      flex: 1,
      backgroundColor: tema.escuro,
      borderRadius: 17,
      padding: 16,
      gap: 10
    },

    cartaoVerde: {
      flex: 1,
      backgroundColor: tema.verde,
      borderRadius: 17,
      padding: 16,
      gap: 10
    },

    rotuloCartaoClaro: {
      color: "#FFFFFF",
      fontSize: 12
    },

    valorCartaoClaro: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "700"
    },

    cartaoPrevisao: {
      backgroundColor: tema.cartao,
      borderRadius: 17,
      padding: 18,
      gap: 8
    },

    rotulo: {
      color: tema.textoSecundario,
      fontSize: 13
    },

    valorPrevisao: {
      color: tema.texto,
      fontSize: 25,
      fontWeight: "700"
    },

    detalhe: {
      color: tema.textoSecundario,
      fontSize: 11
    },

    cabecalhoLista: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 5
    },

    tituloSecao: {
      fontSize: 19,
      fontWeight: "700",
      color: tema.texto
    },

    linhaLeitura: {
      backgroundColor: tema.cartao,
      borderRadius: 14,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },

    informacaoLeitura: {
      flex: 1,
      gap: 5
    },

    aparelho: {
      fontSize: 14,
      fontWeight: "600",
      color: tema.texto
    },

    valorLeitura: {
      fontSize: 13,
      fontWeight: "700",
      color: tema.texto
    },

    alerta: {
      color: tema.alertaTexto,
      fontSize: 11,
      textAlign: "right",
      marginTop: 4
    }
  });
}
