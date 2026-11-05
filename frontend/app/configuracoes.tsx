
import { View, Text, StyleSheet } from "react-native";

export default function TelaConfiguracoes() {
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Configurações</Text>
      <Text>Preferências do aplicativo.</Text>
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
