import { Text } from "react-native";
import { ThemedText } from "@/src/shared/components/ThemedText";
import { StoreSearchField } from "./StoreSearchField";
import { styles } from "./styles";
import type { StoreSearch } from "./types";

/** Title, explanation, and the search box itself. */
export function StoreSearchHeader({ search }: { search: StoreSearch }) {
  return (
    <>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Add Existing Store
      </ThemedText>
      <Text style={styles.subtitle}>
        Stores other agents registered in this area
      </Text>
      <StoreSearchField search={search} />
    </>
  );
}
