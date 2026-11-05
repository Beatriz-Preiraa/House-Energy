
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

export default function TelaCadastro() {
  const { temaAtual } = usarTema();
  const estilos = criarEstilos(temaAtual);
  const roteador = useRouter();
  const [nome, definirNome] = useState("");
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [confirmacao, definirConfirmacao] = useState("");
  const [mensagem, definirMensagem] = useState("");
  const [carregando, definirCarregando] = useState(false);

  async function cadastrar() {
    if (!nome.trim() || !email.trim() || !senha || !confirmacao) {
      definirMensagem("Preencha todos os campos.");
      return;
    }

    if (!email.includes("@")) {
      definirMensagem("Informe um endereço de e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      definirMensagem("A senha deve ter pelo menos seis caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      definirMensagem("As senhas informadas não são iguais.");
      return;
    }

    definirCarregando(true);
    definirMensagem("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          nome: nome.trim(),
        },
      },
    });

    definirCarregando(false);

    if (error) {
      definirMensagem(
        error.message.includes("already registered")
          ? "Este e-mail já possui uma conta cadastrada."
          : "Não foi possível realizar o cadastro. Verifique os dados e tente novamente."
      );
      return;
    }

    if (data.session) {
      roteador.replace("/principal");
      return;
    }

    definirMensagem(
      "Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar."
    );
  }

  return (
    <KeyboardAvoidingView
      style={estilos.pagina}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.cabecalho}>
          <Text style={estilos.marca}>HouseEnergy AI</Text>
          <Text style={estilos.titulo}>Criar conta</Text>
          <Text style={estilos.subtitulo}>
            Cadastre seus dados para começar a acompanhar o consumo de energia.
          </Text>
        </View>

        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>Nome</Text>
          <TextInput
            style={estilos.campo}
            value={nome}
            onChangeText={definirNome}
            placeholder="Seu nome"
            placeholderTextColor={temaAtual.textoSecundario}
            autoCapitalize="words"
          />

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
            placeholder="Mínimo de seis caracteres"
            placeholderTextColor={temaAtual.textoSecundario}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={estilos.rotulo}>Confirmar senha</Text>
          <TextInput
            style={estilos.campo}
            value={confirmacao}
            onChangeText={definirConfirmacao}
            placeholder="Digite a senha novamente"
            placeholderTextColor={temaAtual.textoSecundario}
            secureTextEntry
            autoCapitalize="none"
          />

          {mensagem ? <Text style={estilos.mensagem}>{mensagem}</Text> : null}

          <Pressable
            style={estilos.botaoPrincipal}
            onPress={cadastrar}
            disabled={carregando}
          >
            <Text style={estilos.textoBotaoPrincipal}>
              {carregando ? "Cadastrando..." : "Criar conta"}
            </Text>
          </Pressable>

          <View style={estilos.linhaCadastro}>
            <Text style={estilos.textoAuxiliar}>Já possui uma conta?</Text>
            <Pressable onPress={() => roteador.replace("/login")}>
              <Text style={estilos.link}>Fazer login</Text>
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
      gap: 20,
    },
    cabecalho: { gap: 9, marginBottom: 4 },
    marca: { color: tema.verde, fontSize: 15, fontWeight: "700" },
    titulo: { color: tema.texto, fontSize: 28, fontWeight: "700" },
    subtitulo: { color: tema.textoSecundario, fontSize: 14, lineHeight: 21 },
    cartao: {
      backgroundColor: tema.cartao,
      borderRadius: 18,
      padding: 20,
      gap: 10,
    },
    rotulo: { color: tema.texto, fontSize: 13, fontWeight: "600", marginTop: 4 },
    campo: {
      backgroundColor: tema.fundo,
      borderColor: tema.escuro,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 13,
      paddingVertical: 12,
      color: tema.texto,
      fontSize: 14,
    },
    mensagem: { color: tema.alertaTexto, fontSize: 12, lineHeight: 18, marginTop: 3 },
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
