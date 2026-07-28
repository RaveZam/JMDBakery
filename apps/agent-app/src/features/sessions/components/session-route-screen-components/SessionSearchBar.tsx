import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSessionRoute } from "../../context/useSessionRoute";

export function SessionSearchBar() {
  const { session } = useSessionRoute();

  return (
    <View style={styles.wrapper}>
      <View style={styles.field}>
        <Ionicons name="search" size={16} color="#94A3B8" />
        <TextInput
          style={styles.input}
          value={session.searchQuery}
          onChangeText={session.actions.setSearchQuery}
          placeholder="Search stores"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search stores"
        />
        {session.searchQuery.length > 0 ? (
          <TouchableOpacity
            onPress={() => session.actions.setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
  },
});
