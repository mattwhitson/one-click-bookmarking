import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useIsFirstLoad(isFetching: boolean) {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [haveParamsChanged, setHaveParamsChanged] = useState(true);
  const searchParams = useSearchParams();
  const [currentParams, setCurrentParams] =
    useState<ReadonlyURLSearchParams | null>(null);

  useEffect(() => {
    if (currentParams === searchParams) {
      if (!isFetching) {
        setHaveParamsChanged(false);
      }
      return;
    }

    setHaveParamsChanged(true);
    setCurrentParams(searchParams);
  }, [isFetching, currentParams, searchParams]);

  useEffect(() => {
    if (!isFetching) setIsFirstLoad(false);
  }, [isFetching]);

  return { isFirstLoad, haveParamsChanged };
}
