import { useEffect, useState } from "react";
import { getUserEmail } from "../services/getUserEmail";
import { getUserName } from "../services/getUserName";

export function useAccountUser(): {
  email: string | null | undefined;
  name: string | null | undefined;
} {
  const [email, setEmail] = useState<string | null>();
  const [name, setName] = useState<string | null>();
  useEffect(() => {
    async function loadUser(): Promise<void> {
      setEmail(await getUserEmail());
      setName(await getUserName());
    }
    loadUser();
  }, []);
  return { email, name };
}
