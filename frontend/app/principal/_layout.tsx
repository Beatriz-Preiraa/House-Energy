
import { useEffect, useState } from "react";
import { Tabs, Redirect } from "expo-router";
import { usarTema } from "../../contextos/TemaContexto";
import { supabase } from "../../servicos/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function LayoutPrincipal() {
  const { temaAtual } = usarTema();
  const [autenticado, definirAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();
      definirAutenticado(!!data.session);
    }

    verificarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        definirAutenticado(!!sessao);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (autenticado === null) {
    return null;
  }

  if (!autenticado) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: temaAtual.textoRoxo,
        tabBarInactiveTintColor: temaAtual.textoSecundario,
        tabBarStyle: {
          backgroundColor: temaAtual.cartao,
          borderTopColor: temaAtual.fundo,
          height: 64,
          paddingTop: 7,
          paddingBottom: 7,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarLabel: "Início",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={focused ? temaAtual.textoRoxo : temaAtual.textoSecundario}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="consumo"
        options={{
          title: "Consumo",
          tabBarLabel: "Consumo",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "flash" : "flash-outline"}
              size={size}
              color={focused ? temaAtual.textoRoxo : temaAtual.textoSecundario}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="aparelhos"
        options={{
          title: "Aparelhos",
          tabBarLabel: "Aparelhos",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "bulb" : "bulb-outline"}
              size={size}
              color={focused ? temaAtual.textoRoxo : temaAtual.textoSecundario}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Configurações",
          tabBarLabel: "Config.",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={focused ? temaAtual.textoRoxo : temaAtual.textoSecundario}
            />
          ),
        }}
      />
    </Tabs>
  );
}
