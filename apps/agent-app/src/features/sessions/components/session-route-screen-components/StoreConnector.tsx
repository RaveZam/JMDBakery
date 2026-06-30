import { StyleSheet, View } from "react-native";

export function StoreConnector() {
  return (
    <View style={styles.connectorWrapper}>
      <View style={styles.connectorLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  connectorWrapper: {
    alignItems: "center",
    paddingLeft: 20,
  },
  connectorLine: {
    width: 1.5,
    height: 10,
    backgroundColor: "#CBD5E1",
  },
});
