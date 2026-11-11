
import { Stack } from "expo-router";
import { useFonts } from "expo-font";

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { DadosProvider } from "../contextos/DadosContexto";
import { TemaProvider } from "../contextos/TemaContexto";

export default function LayoutPrincipal() {
  const [fontesCarregadas] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontesCarregadas) {
    return null;
  }

  return (
    <TemaProvider>
      <DadosProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="principal" />
        </Stack>
      </DadosProvider>
    </TemaProvider>
  );
}
