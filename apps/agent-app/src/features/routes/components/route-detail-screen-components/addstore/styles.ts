import { StyleSheet } from "react-native";
import { Colors } from "@/src/shared/constants/Colors";

export const styles = StyleSheet.create({
  // AddStoreChoiceModal
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  choiceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceTextWrap: {
    flex: 1,
    gap: 2,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  choiceCaption: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  cancel: {
    width: "100%",
    marginTop: 8,
  },

  // AddExistingStoreModal
  content: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: -8,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
    color: "#0F172A",
  },
  searchButton: {
    width: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    maxHeight: 320,
  },
  placeholder: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  placeholderText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  resultAddress: {
    fontSize: 12,
    color: "#64748B",
  },
  resultOwner: {
    fontSize: 11,
    fontWeight: "600",
    color: "#B8923F",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  doneButton: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
});
