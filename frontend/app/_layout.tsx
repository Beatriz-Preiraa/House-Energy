
import { Stack } from "expo-router";
import { DadosProvider } from "../contextos/DadosContexto";
import { TemaProvider } from "../contextos/TemaContexto";

export default function LayoutPrincipal() {
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
