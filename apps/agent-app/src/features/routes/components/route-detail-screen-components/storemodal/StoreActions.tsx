import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
};

export function StoreActions({ onEdit, onDelete }: Props) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={onEdit}
        activeOpacity={0.85}
      >
        <Ionicons name="create-outline" size={17} color="#FFFFFF" />
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={onDelete}
        activeOpacity={0.85}
      >
        <Ionicons name="trash-outline" size={17} color="#DC2626" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}
