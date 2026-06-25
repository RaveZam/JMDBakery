import { StyleSheet, TextInput, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Header } from "@/src/shared/components/ui/header";
import { useRouteDetail } from "../../context/useRouteDetail";

export function RouteDetailHeader() {
  const {
    routeName,
    isEditing,
    isEditingName,
    setIsEditingName,
    routeNameDraft,
    setRouteNameDraft,
    handleSaveRouteName,
    handleToggleEditing,
  } = useRouteDetail();

  return (
    <Header
      title={routeName}
      onBack={() => router.push("/main/routes")}
      titleElement={
        isEditing ? (
          isEditingName ? (
            <TextInput
              value={routeNameDraft}
              onChangeText={setRouteNameDraft}
              onEndEditing={handleSaveRouteName}
              autoFocus
              selectTextOnFocus
              style={styles.routeNameInput}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity
              style={styles.routeNameTouchable}
              activeOpacity={0.7}
              onPress={() => {
                setRouteNameDraft(routeName);
                setIsEditingName(true);
              }}
            >
              <Text style={styles.routeNameEditable} numberOfLines={1}>
                {routeName}
              </Text>
              <Ionicons name="pencil-outline" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          )
        ) : undefined
      }
      rightElement={
        <TouchableOpacity
          onPress={handleToggleEditing}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.editButton}>{isEditing ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  editButton: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    padding: 6,
  },
  routeNameTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  routeNameEditable: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(255,255,255,0.6)",
    flexShrink: 1,
  },
  routeNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(255,255,255,0.7)",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
