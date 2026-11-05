import { View,Text,StyleSheet } from "react-native";


export default function TelaConsumo() {
     return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Consumo de Energia</Text>
      <Text>Histórico e gráficos de consumo.</Text>
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