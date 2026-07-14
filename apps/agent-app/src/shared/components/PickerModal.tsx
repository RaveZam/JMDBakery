import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

// Structural shape only — shared/ must not import a features/ type.
export type PickerProduct = {
  id: string;
  name: string;
  price: number;
};

export type PickerModalProps = {
  visible: boolean;
  products: PickerProduct[];
  showPrice: boolean;
  remainingByProduct?: Record<string, number>;
  onClose: () => void;
  onSelected: (product: PickerProduct) => void;
};

const CARD_BG = "#FFFFFF";
const BORDER = "#E2E8F0";

function PickerRow({
  item,
  index,
  showPrice,
  remaining,
  onPress,
}: {
  item: PickerProduct;
  index: number;
  showPrice: boolean;
  remaining?: number;
  onPress: () => void;
}) {
  const outOfStock = remaining !== undefined && remaining <= 0;
  const textStyle = [styles.modalOptionText, outOfStock && styles.modalOptionTextDisabled];
  const badgeStyle = [styles.remainingBadge, outOfStock && styles.remainingBadgeEmpty];
  const badgeTextStyle = [styles.remainingText, outOfStock && styles.remainingTextEmpty];
  return (
    <TouchableOpacity
      style={[styles.modalOption, outOfStock && styles.modalOptionDisabled]}
      disabled={outOfStock}
      onPress={onPress}
      testID={`picker-option-${index}`}
    >
      <Text style={textStyle}>
        {item.name}
        {showPrice ? `  —  ₱${item.price}` : ""}
      </Text>
      {remaining !== undefined && (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>{remaining} left</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function PickerModal({
  visible,
  products,
  showPrice,
  remainingByProduct,
  onClose,
  onSelected,
}: PickerModalProps) {
  function handleSelect(item: PickerProduct) {
    onSelected(item);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            renderItem={({ item, index }) => (
              <PickerRow
                item={item}
                index={index}
                showPrice={showPrice}
                remaining={remainingByProduct?.[item.id]}
                onPress={() => handleSelect(item)}
              />
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    maxHeight: 320,
    overflow: "hidden",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalOptionDisabled: { backgroundColor: "#F8FAFC", opacity: 0.55 },
  modalOptionText: { flex: 1, fontSize: 14, color: "#0F172A" },
  modalOptionTextDisabled: { color: "#94A3B8" },
  remainingBadge: {
    borderRadius: 999,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  remainingBadgeEmpty: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  remainingText: { fontSize: 12, fontWeight: "700", color: "#16A34A" },
  remainingTextEmpty: { color: "#DC2626" },
});
