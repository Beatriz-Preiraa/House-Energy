
import { Tabs } from "expo-router";
import { TemaProvider } from "../contextos/TemaContexto";

export default function LayoutPrincipal() {
  return (
    <TemaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#8B65C7",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarLabel: "Início",
          }}
        />

        <Tabs.Screen
          name="consumo"
          options={{
            title: "Consumo",
            tabBarLabel: "Consumo",
          }}
        />

        <Tabs.Screen
          name="aparelhos"
          options={{
            title: "Aparelhos",
            tabBarLabel: "Aparelhos",
          }}
        />

        <Tabs.Screen
          name="configuracoes"
          options={{
            title: "Configurações",
            tabBarLabel: "Config.",
          }}
        />
      </Tabs>
    </TemaProvider>
  );
}
