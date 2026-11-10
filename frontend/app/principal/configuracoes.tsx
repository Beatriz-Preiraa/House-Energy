import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usarTema } from "../../contextos/TemaContexto";
import { useRouter } from "expo-router";
import { enderecoApi, verificarApi, EstadoSaude } from "../../servicos/api";
import { supabase } from "../../servicos/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function TelaConfiguracoes() {
  const { modoEscuro, definirModoEscuro, temaAtual } = usarTema();
  const roteador = useRouter();
  const estilos = criarEstilos(temaAtual);
  const [estadoApi, definirEstadoApi] = useState<EstadoSaude | null>(null);
  const [erro, definirErro] = useState("");
  const [verificando, definirVerificando] = useState(false);
  const [saindo, definirSaindo] = useState(false);
  const [erroSaida, definirErroSaida] = useState("");

  async function testarConexao() {
    definirVerificando(true);
    try {
      const estado = await verificarApi();
      definirEstadoApi(estado);
      definirErro("");
    } catch (erroConsulta) {
      definirEstadoApi(null);
      definirErro(
        erroConsulta instanceof Error
          ? erroConsulta.message
          : "Não foi possível conectar à API."
      );
    } finally {
      definirVerificando(false);
    }
  }
  async function sairDaConta() {
    definirSaindo(true);
    definirErroSaida("");

    const { error } = await supabase.auth.signOut();

    definirSaindo(false);

    if (error) {
      definirErroSaida("Não foi possível encerrar a sessão.");
      return;
    }

    roteador.replace("/login");
  }

  useEffect(() => {
    testarConexao();
  }, []);

  return (
    <ScrollView
      style={estilos.pagina}
      contentContainerStyle={estilos.conteudo}
    >
      <View style={estilos.cabecalho}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            name="settings-outline"
            size={27}
            color={temaAtual.textoRoxo}
          />

          <Text style={estilos.titulo}>Configurações</Text>
        </View>

        <Text style={estilos.subtitulo}>
          Preferências e conexão do HouseEnergy AI
        </Text>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Aparência</Text>
        <View style={estilos.linha}>
          <View style={estilos.informacao}>
            <Text style={estilos.texto}>Modo escuro</Text>
            <Text style={estilos.detalhe}>
              Ajusta as cores das telas do aplicativo
            </Text>
          </View>
          <Pressable
            style={[
              estilos.botaoAlternar,
              modoEscuro && estilos.botaoAlternarAtivo,
            ]}
            onPress={() => definirModoEscuro(!modoEscuro)}
          >
            <Text style={estilos.textoBotao}>
              {modoEscuro ? "Ativado" : "Desativado"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Conexão com o servidor</Text>
        <Text style={estilos.detalhe}>Endereço configurado</Text>
        <Text selectable style={estilos.endereco}>{enderecoApi}</Text>

        <View style={estilos.linha}>
          <Text style={estilos.texto}>Estado da API</Text>
          {verificando ? (
            <ActivityIndicator color={temaAtual.verde} />
          ) : (
            <Text
              style={[
                estilos.estado,
                estadoApi ? estilos.estadoAtivo : estilos.estadoErro,
              ]}
            >
              {estadoApi ? "Conectada" : "Sem conexão"}
            </Text>
          )}
        </View>

        {estadoApi ? (
          <Text style={estilos.detalhe}>
            {estadoApi.leituras_registradas} leituras registradas no servidor
          </Text>
        ) : null}

        {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

        <Pressable
          style={estilos.botao}
          onPress={testarConexao}
          disabled={verificando}
        >
          <Text style={estilos.textoBotaoPrincipal}>
            Testar conexão
          </Text>
        </Pressable>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Acesso à conta</Text>
        <Text style={estilos.detalhe}>
          Encerre sua sessão no HouseEnergy AI.
        </Text>

        {erroSaida ? (
          <Text style={estilos.erro}>{erroSaida}</Text>
        ) : null}

        <Pressable
          style={estilos.botao}
          onPress={sairDaConta}
          disabled={saindo}
        >
          <Text style={estilos.textoBotaoPrincipal}>
            {saindo ? "Saindo..." : "Sair da conta"}
          </Text>
        </Pressable>
      </View>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloSecao}>Atualização dos dados</Text>
        <Text style={estilos.detalhe}>
          As telas consultam a API automaticamente a cada 10 segundos. Também
          é possível atualizar os dados manualmente ao deslizar a tela para
          baixo.
        </Text>
      </View>

      <Text style={estilos.versao}>HouseEnergy AI · Versão 1.0.0</Text>
    </ScrollView>
  );
}

function criarEstilos(tema: any) {
  return StyleSheet.create({
    pagina: { flex: 1, backgroundColor: tema.fundo },
    conteudo: { padding: 20, paddingTop: 35, paddingBottom: 30, gap: 16 },
    cabecalho: { gap: 5, marginBottom: 5 },
    titulo: { fontSize: 24, fontWeight: "700", color: tema.texto },
    subtitulo: { fontSize: 13, color: tema.textoSecundario },
    cartao: {
      backgroundColor: tema.cartao,
      borderRadius: 17,
      padding: 18,
      gap: 13,
    },
    tituloSecao: { fontSize: 17, fontWeight: "700", color: tema.texto },
    linha: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    informacao: { flex: 1, gap: 5 },
    texto: { color: tema.texto, fontSize: 14, fontWeight: "600" },
    detalhe: { color: tema.textoSecundario, fontSize: 12, lineHeight: 18 },
    botaoAlternar: {
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 10,
      backgroundColor: tema.fundo,
    },
    botaoAlternarAtivo: { backgroundColor: tema.verde },
    textoBotao: { color: tema.texto, fontSize: 12, fontWeight: "600" },
    endereco: { color: tema.texto, fontSize: 12 },
    estado: { fontSize: 12, fontWeight: "700" },
    estadoAtivo: { color: tema.verde },
    estadoErro: { color: tema.alertaTexto },
    erro: { color: tema.alertaTexto, fontSize: 12 },
    botao: {
      backgroundColor: tema.escuro,
      borderRadius: 11,
      padding: 13,
      alignItems: "center",
    },
    textoBotaoPrincipal: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
    versao: { color: tema.textoSecundario, textAlign: "center", fontSize: 11 },
  });
}
