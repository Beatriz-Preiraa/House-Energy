import { View,Text,StyleSheet } from "react-native";

export default function TelaAparelhos() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Meus Aparelhos</Text>
      <Text>Lista de aparelhos conectados.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

