
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { supabase } from "../servicos/supabase";

export default function Inicio() {
  const [destino, definirDestino] = useState<"/login" | "/principal" | null>(null);

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();
      definirDestino(data.session ? "/principal" : "/login");
    }

    verificarSessao();
  }, []);

  if (!destino) {
    return null;
  }

  return <Redirect href={destino} />;
}
