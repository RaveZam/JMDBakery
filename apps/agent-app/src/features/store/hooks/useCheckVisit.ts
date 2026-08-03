import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getSessionStoreById } from "../services/store-services";

/**
 * Guards the back navigation on the store screen. If the current
 * session_store hasn't been marked visited yet, shows a reminder modal
 * instead of leaving immediately, so an agent doesn't accidentally skip a
 * visit confirmation.
 *
 * @returns reminder modal visibility and the back/leave/stay handlers
 */
export function useCheckVisit() {
  const { sessionStoreId } = useLocalSearchParams<{
    sessionStoreId?: string;
  }>();
  const router = useRouter();
  const [isReminderVisible, setIsReminderVisible] = useState(false);

  const requestBack = () => {
    // Read fresh instead of reusing useStoreDetails' mount-time snapshot:
    // that one is never refetched, so a visit confirmed on this screen
    // would still look unconfirmed here.
    const sessionStore = sessionStoreId
      ? getSessionStoreById(sessionStoreId)
      : null;
    if (!sessionStore || sessionStore.visited === 1) {
      router.back();
      return;
    }
    setIsReminderVisible(true);
  };

  const leaveAnyway = () => {
    setIsReminderVisible(false);
    router.back();
  };

  const stay = () => setIsReminderVisible(false);

  return { isReminderVisible, requestBack, leaveAnyway, stay };
}
