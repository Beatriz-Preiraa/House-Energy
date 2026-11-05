
import { createContext, useContext, useState, ReactNode } from "react";
import { temaClaro, temaEscuro } from "../estilos/temas";

type TemaContextoTipo = {
  modoEscuro: boolean;
  definirModoEscuro: (valor: boolean) => void;
  temaAtual: typeof temaClaro;
};

const TemaContexto = createContext<TemaContextoTipo | undefined>(undefined);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [modoEscuro, definirModoEscuro] = useState(false);

  const temaAtual = modoEscuro ? temaEscuro : temaClaro;

  return (
    <TemaContexto.Provider
      value={{
        modoEscuro,
        definirModoEscuro,
        temaAtual,
      }}
    >
      {children}
    </TemaContexto.Provider>
  );
}

export function usarTema() {
  const contexto = useContext(TemaContexto);

  if (!contexto) {
    throw new Error("O tema precisa estar dentro do TemaProvider.");
  }

  return contexto;
}
