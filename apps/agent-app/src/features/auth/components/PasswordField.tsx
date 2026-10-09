import type { ReactElement } from "react";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/shared/constants/Colors";

type PasswordFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
};

// Password input with an eye button that shows or hides the text.
function PasswordField({ value, onChangeText }: PasswordFieldProps): ReactElement {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.inputWrap}>
      <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={() => setVisible((shown) => !shown)}
        accessibilityRole="button"
        accessibilityLabel={visible ? "Hide password" : "Show password"}
        hitSlop={8}
      >
        <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={18} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    gap: 8,
  },
  inputIcon: {
    width: 20,
  },
  input: {
    flex: 1,
    height: "100%",
    color: Colors.light.text,
    fontSize: 14,
  },
});

export { PasswordField };
