import { Modal, View, Text } from "react-native";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";
import { StoreChoiceList } from "./StoreChoiceList";
import type { AddStoreChoiceModalProps } from "./types";

/** Asks whether the agent is registering a new store or picking up a known one. */
export function AddStoreChoiceModal({
  provinceName,
  visible,
  ...choices
}: AddStoreChoiceModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={choices.onClose}
    >
      <View style={m.backdrop}>
        <View style={m.content}>
          <Text style={m.title}>Add Store</Text>
          <Text style={m.body}>{provinceName}</Text>
          <StoreChoiceList {...choices} />
        </View>
      </View>
    </Modal>
  );
}
