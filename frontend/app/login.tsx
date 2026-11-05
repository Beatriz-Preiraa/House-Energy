
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { usarTema } from "../contextos/TemaContexto";
import { supabase } from "../servicos/supabase";

export default function TelaLogin() {
  const { temaAtual } = usarTema();
  const estilos = criarEstilos(temaAtual);
  const roteador = useRouter();
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [mensagem, definirMensagem] = useState("");
  const [carregando, definirCarregando] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) {
      definirMensagem("Informe seu e-mail e sua senha.");
      return;
    }

    definirCarregando(true);
    definirMensagem("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    definirCarregando(false);

    if (error) {
      definirMensagem(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Verifique seus dados e tente novamente."
      );
      return;
    }

    roteador.replace("/principal");
  }

  return (
    <KeyboardAvoidingView
      style={estilos.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.cabecalho}>
          <Text style={estilos.marca}>HouseEnergy AI</Text>
          <Text style={estilos.titulo}>Acesse sua conta</Text>
          <Text style={estilos.subtitulo}>
            Entre para acompanhar o consumo de energia da sua residência.
          </Text>
        </View>

        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>E-mail</Text>
          <TextInput
            style={estilos.campo}
            value={email}
            onChangeText={definirEmail}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={temaAtual.textoSecundario}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={estilos.rotulo}>Senha</Text>
          <TextInput
            style={estilos.campo}
            value={senha}
            onChangeText={definirSenha}
            placeholder="Digite sua senha"
            placeholderTextColor={temaAtual.textoSecundario}
            secureTextEntry
            autoCapitalize="none"
          />

          <Pressable onPress={() => definirMensagem("A recuperação de senha será disponibilizada em uma próxima etapa.")}>
            <Text style={estilos.linkDireita}>Esqueci minha senha</Text>
          </Pressable>

          {mensagem ? <Text style={estilos.mensagem}>{mensagem}</Text> : null}

          <Pressable
            style={estilos.botaoPrincipal}
            onPress={entrar}
            disabled={carregando}
          >
            <Text style={estilos.textoBotaoPrincipal}>
              {carregando ? "Entrando..." : "Entrar"}
            </Text>
          </Pressable>

          <View style={estilos.linhaCadastro}>
            <Text style={estilos.textoAuxiliar}>Ainda não tem uma conta?</Text>
            <Pressable onPress={() => roteador.push("/cadastro")}>
              <Text style={estilos.link}>Criar conta</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => roteador.replace("/")}>
          <Text style={estilos.voltar}>Voltar ao aplicativo</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function criarEstilos(tema: any) {
  return StyleSheet.create({
    pagina: { flex: 1, backgroundColor: tema.fundo },
    conteudo: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
      gap: 22,
    },
    cabecalho: { gap: 9, marginBottom: 8 },
    marca: { color: tema.verde, fontSize: 15, fontWeight: "700" },
    titulo: { color: tema.texto, fontSize: 28, fontWeight: "700" },
    subtitulo: { color: tema.textoSecundario, fontSize: 14, lineHeight: 21 },
    cartao: {
      backgroundColor: tema.cartao,
      borderRadius: 18,
      padding: 20,
      gap: 12,
    },
    rotulo: { color: tema.texto, fontSize: 13, fontWeight: "600", marginTop: 5 },
    campo: {
      backgroundColor: tema.fundo,
      borderColor: tema.escuro,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 13,
      paddingVertical: 13,
      color: tema.texto,
      fontSize: 14,
    },
    linkDireita: {
      color: tema.textoRoxo,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "right",
      marginTop: 2,
    },
    mensagem: { color: tema.alertaTexto, fontSize: 12, lineHeight: 18 },
    botaoPrincipal: {
      backgroundColor: tema.escuro,
      borderRadius: 11,
      padding: 15,
      alignItems: "center",
      marginTop: 5,
    },
    textoBotaoPrincipal: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
    linhaCadastro: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 5,
      marginTop: 5,
    },
    textoAuxiliar: { color: tema.textoSecundario, fontSize: 12 },
    link: { color: tema.textoRoxo, fontSize: 12, fontWeight: "700" },
    voltar: { color: tema.textoSecundario, fontSize: 12, textAlign: "center" },
  });
}
