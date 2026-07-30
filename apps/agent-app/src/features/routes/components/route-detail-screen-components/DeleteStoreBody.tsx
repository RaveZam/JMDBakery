import { Text } from "react-native";
import { StoreRow } from "../../types/db-rows";
import { modalStyles as m } from "@/src/shared/styles/modalStyles";

type Props = {
  store: StoreRow | null;
  isOwnStore: boolean;
};

/**
 * The confirmation copy, which says two quite different things: deleting a store
 * you registered destroys it for everyone, while confirming on a colleague's
 * store only takes it off your own route.
 */
export function DeleteStoreBody({ store, isOwnStore }: Props) {
  if (isOwnStore) {
    return (
      <Text style={m.body}>
        Are you sure you want to delete{" "}
        <Text style={m.highlight}>{store?.name}</Text>?
      </Text>
    );
  }
  return (
    <Text style={m.body}>
      Take <Text style={m.highlight}>{store?.name}</Text> off this route?
      {store?.created_by_name
        ? ` ${store.created_by_name} registered it, so their copy stays.`
        : " The store itself stays with the agent who registered it."}
    </Text>
  );
}
