
import { View, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  Text as TextoSvg,
} from "react-native-svg";

type Propriedades = {
  valor: number;
  meta: number;
  corTexto: string;
  corSecundaria: string;
  corTrilho: string;
  corProgresso: string;
};

export default function Velocimetro({
  valor,
  meta,
  corTexto,
  corSecundaria,
  corTrilho,
  corProgresso,
}: Propriedades) {
  const raio = 90;
  const comprimento = Math.PI * raio;

  const progresso = Math.min(
    Math.max(meta > 0 ? valor / meta : 0, 0),
    1
  );

  const deslocamento = comprimento * (1 - progresso);

  const angulo = Math.PI * (1 - progresso);

  const posicaoX = 130 + raio * Math.cos(angulo);
  const posicaoY = 130 - raio * Math.sin(angulo);

  return (
    <View style={estilos.container}>
      <Svg
        width="100%"
        height={190}
        viewBox="0 0 260 180"
      >
        {/* Fundo do velocímetro */}
        <Path
          d="M 40 130 A 90 90 0 0 1 220 130"
          fill="none"
          stroke={corTrilho}
          strokeWidth={15}
          strokeLinecap="round"
        />

        {/* Progresso do consumo */}
        <Path
          d="M 40 130 A 90 90 0 0 1 220 130"
          fill="none"
          stroke={corProgresso}
          strokeWidth={15}
          strokeLinecap="round"
          strokeDasharray={`${comprimento} ${comprimento}`}
          strokeDashoffset={deslocamento}
        />

        {/* Marcador acompanha o consumo */}
        <Circle
          cx={posicaoX}
          cy={posicaoY}
          r={10}
          fill={corProgresso}
        />

        {/* Símbolo de energia */}
        <Path
          d="M 134 72 L 121 91 L 130 91 L 126 105 L 141 84 L 132 84 Z"
          fill={corProgresso}
        />

        {/* Valor central */}
        <TextoSvg
          x="130"
          y="120"
          fill={corTexto}
          fontSize="27"
          fontWeight="700"
          fontFamily="Inter_700Bold"
          textAnchor="middle"
        >
          {valor.toFixed(2).replace(".", ",")}
        </TextoSvg>

        {/* Unidade */}
        <TextoSvg
          x="130"
          y="139"
          fill={corSecundaria}
          fontSize="11"
          fontFamily="Inter_400Regular"
          textAnchor="middle"
        >
          kWh registrados
        </TextoSvg>

        {/* Limite inicial */}
        <TextoSvg
          x="30"
          y="165"
          fill={corSecundaria}
          fontSize="11"
          fontFamily="Inter_400Regular"
        >
          0 kWh
        </TextoSvg>

        {/* Limite final */}
        <TextoSvg
          x="230"
          y="165"
          fill={corSecundaria}
          fontSize="11"
          fontFamily="Inter_400Regular"
          textAnchor="end"
        >
          {meta} kWh
        </TextoSvg>
      </Svg>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
