import { useEffect, useState } from "react";

export function useLoading(isPending: boolean) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    function onTimeout() {
      if (!isPending) {
        if (timeoutId) window.clearTimeout(timeoutId);
        setIsLoading(false);
        return;
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setIsLoading(true);
      }, 500);
    }

    onTimeout();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isPending]);

  return { isLoading };
}
