import { View, Text, TouchableOpacity } from "react-native";
import { styles as s } from "./styles";

// Correcting an entry is only offered on the agent's own. Supabase scopes the
// update and delete policies to recorded_by, so on a colleague's entry these
// buttons would produce a write the server refuses.
//
// Kept on their own row: with Close and Record payment beside them, four pills
// sharing one row squeezed the primary label until it wrapped out of its pill.
export function OwnerActions({
  canModify,
  onEdit,
  onDelete,
}: {
  canModify: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!canModify) return null;

  return (
    <View style={s.actionRow}>
      <TouchableOpacity style={s.secondaryButton} onPress={onDelete}>
        <Text style={s.destructiveText}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.secondaryButton} onPress={onEdit}>
        <Text style={s.secondaryText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}
