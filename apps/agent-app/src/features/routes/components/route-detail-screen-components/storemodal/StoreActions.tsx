import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

type Props = {
  /**
   * False for a store another agent registered: their details are theirs to
   * change, so the only action offered is dropping it from this route.
   */
  isOwnStore: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function StoreActions({ isOwnStore, onEdit, onDelete }: Props) {
  return (
    <View style={styles.actions}>
      {isOwnStore && (
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={17} color="#FFFFFF" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={onDelete}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isOwnStore ? "trash-outline" : "remove-circle-outline"}
          size={17}
          color="#DC2626"
        />
        <Text style={styles.deleteText}>
          {isOwnStore ? "Delete" : "Remove"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
