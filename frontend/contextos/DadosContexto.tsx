import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  buscarLeituras,
  buscarPrevisao,
  buscarResumo,
  DadosResumo,
  Leitura,
  Previsao,
} from "../servicos/api";

type DadosContextoTipo = {
  resumo: DadosResumo | null;
  leituras: Leitura[];
  previsao: Previsao | null;
  erroResumo: string;
  erroLeituras: string;
  erroPrevisao: string;
  carregando: boolean;
  atualizar: () => Promise<void>;
};

const DadosContexto = createContext<DadosContextoTipo | undefined>(undefined);

export function DadosProvider({ children }: { children: ReactNode }) {
  const [resumo, definirResumo] = useState<DadosResumo | null>(null);
  const [leituras, definirLeituras] = useState<Leitura[]>([]);
  const [previsao, definirPrevisao] = useState<Previsao | null>(null);
  const [erroResumo, definirErroResumo] = useState("");
  const [erroLeituras, definirErroLeituras] = useState("");
  const [erroPrevisao, definirErroPrevisao] = useState("");
  const [carregando, definirCarregando] = useState(true);

  const atualizar = useCallback(async () => {
    const resultados = await Promise.allSettled([
      buscarResumo(),
      buscarLeituras(),
      buscarPrevisao(),
    ]);

    const [resultadoResumo, resultadoLeituras, resultadoPrevisao] = resultados;

    if (resultadoResumo.status === "fulfilled") {
      definirResumo(resultadoResumo.value);
      definirErroResumo("");
    } else {
      definirErroResumo(
        resultadoResumo.reason instanceof Error
          ? resultadoResumo.reason.message
          : "Não foi possível consultar o resumo."
      );
    }

    if (resultadoLeituras.status === "fulfilled") {
      definirLeituras(resultadoLeituras.value);
      definirErroLeituras("");
    } else {
      definirErroLeituras(
        resultadoLeituras.reason instanceof Error
          ? resultadoLeituras.reason.message
          : "Não foi possível consultar as leituras."
      );
    }

    if (resultadoPrevisao.status === "fulfilled") {
      definirPrevisao(resultadoPrevisao.value);
      definirErroPrevisao("");
    } else {
      definirPrevisao(null);
      definirErroPrevisao(
        resultadoPrevisao.reason instanceof Error
          ? resultadoPrevisao.reason.message
          : "Previsão indisponível."
      );
    }

    definirCarregando(false);
  }, []);

  useEffect(() => {
    atualizar();
    const intervalo = setInterval(atualizar, 10000);

    return () => clearInterval(intervalo);
  }, [atualizar]);

  const valor = useMemo(
    () => ({
      resumo,
      leituras,
      previsao,
      erroResumo,
      erroLeituras,
      erroPrevisao,
      carregando,
      atualizar,
    }),
    [
      resumo,
      leituras,
      previsao,
      erroResumo,
      erroLeituras,
      erroPrevisao,
      carregando,
      atualizar,
    ]
  );

  return (
    <DadosContexto.Provider value={valor}>
      {children}
    </DadosContexto.Provider>
  );
}

export function usarDados() {
  const contexto = useContext(DadosContexto);

  if (!contexto) {
    throw new Error("Os dados precisam estar dentro do DadosProvider.");
  }

  return contexto;
}
