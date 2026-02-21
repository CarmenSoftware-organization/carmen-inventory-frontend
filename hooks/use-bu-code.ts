import { useProfile } from "@/hooks/use-profile";

export function useBuCode() {
  const { buCode } = useProfile();
  return buCode;
}
