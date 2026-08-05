import { StyleSheet } from "react-native";

export const INK = "#0F172A";
export const MUTED = "#64748B";
export const FAINT = "#94A3B8";
export const BORDER = "#E2E8F0";
export const CREDIT_RED = "#EF4444";
export const PAYMENT_GREEN = "#16A34A";
export const BRAND_GREEN = "#0b4c29";

// Shared shell for every view of the credit modal, styled like a paper receipt: the
// amount at the top, the ledger detail below a torn edge, and actions pinned
// to the bottom.
export const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  head: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "#F5F5F0",
    gap: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: MUTED,
    letterSpacing: 0.8,
  },
  amount: { fontSize: 30, fontWeight: "700", color: INK, letterSpacing: -0.6 },
  amountCredit: { color: CREDIT_RED },
  amountPayment: { color: PAYMENT_GREEN },
  meta: { fontSize: 12, color: MUTED },

  tornEdge: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderStyle: "dashed",
  },

  body: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  bodyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: FAINT,
    letterSpacing: 0.8,
  },
  emptyNote: { fontSize: 13, color: MUTED, lineHeight: 19 },

  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  itemName: { flex: 1, fontSize: 13, fontWeight: "600", color: INK },
  itemBadOrder: { fontSize: 11, color: FAINT, marginTop: 2 },
  itemQty: { width: 40, fontSize: 13, color: MUTED, textAlign: "right" },
  itemAmount: {
    width: 76,
    fontSize: 13,
    fontWeight: "600",
    color: INK,
    textAlign: "right",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  totalLabel: { fontSize: 12, fontWeight: "700", color: MUTED },
  totalValue: { fontSize: 15, fontWeight: "700", color: INK },

  amountField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 60,
  },
  peso: { fontSize: 22, fontWeight: "700", color: FAINT },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "700",
    color: INK,
    padding: 0,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  helperText: { fontSize: 12, color: MUTED },
  payFullChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EAF6EF",
  },
  payFullText: { fontSize: 12, fontWeight: "700", color: BRAND_GREEN },

  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  // Same footer, stacked: one row of buttons per tier, so a modal with edit and
  // delete on it doesn't have to fit four pills across a phone.
  actionStack: {
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 4,
  },
  actionRow: { flexDirection: "row", gap: 10 },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14, fontWeight: "500", color: INK },
  destructiveText: { fontSize: 14, fontWeight: "500", color: "#EF4444" },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: BRAND_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: { backgroundColor: "#CBD5E1" },
  primaryText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
