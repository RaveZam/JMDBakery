import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption: string;
  onPress: () => void;
  testID: string;
};

/** One tappable option in the "how do you want to add a store" list. */
export function StoreChoice({ icon, label, caption, onPress, testID }: Props) {
  return (
    <TouchableOpacity
      style={styles.choice}
      activeOpacity={0.7}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.choiceIconWrap}>
        <Ionicons name={icon} size={20} color="#3F7355" />
      </View>
      <View style={styles.choiceTextWrap}>
        <Text style={styles.choiceLabel}>{label}</Text>
        <Text style={styles.choiceCaption}>{caption}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}
