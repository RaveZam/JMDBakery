import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

export function DetailRow({ icon, text }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color="#94A3B8" />
      <Text style={styles.fieldText}>{text}</Text>
    </View>
  );
}
