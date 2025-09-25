import { useMutation, useQueryClient } from "react-query";
import { useEffect, useState } from "react";

const fnWrapper =
  (_Fn) =>
  async ({ reqData, __catchID, controllerFinal }: any) => {
    return _Fn({ reqData, __catchID, controllerFinal });
  };

export function useCacheWithMutation(queryKey, mutationFn) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(null);
  const mutation: any = useMutation<any, any, any, any>(fnWrapper(mutationFn), {
    onSuccess(data, { __catchID }) {
      queryClient.setQueryData([queryKey, { __catchID }], data);
    },
  });

  useEffect(() => {
    setIsLoading(mutation.isLoading);
    setData(mutation.data);
    setError(mutation.error);
    setIsError(mutation.isError);
  }, [mutation.isLoading, mutation.data, mutation.isError, mutation.error]);

  const fetchData = ({ cacheId, reqData, controllerFinal = {} }) => {
    // setIsLoading(true);
    const cachedData = queryClient.getQueryData([
      queryKey,
      { __catchID: cacheId },
    ]);
    if (cachedData) {
      setData(cachedData);
      // setIsLoading(false);
    } else {
      mutation.mutate({ reqData, __catchID: cacheId, controllerFinal });
    }
  };
  const clearMutationCache = (__catchID = null) => {
    if (__catchID) {
      queryClient.removeQueries([queryKey, { __catchID }]);
    } else {
      queryClient.removeQueries(queryKey);
    }
  };
  return {
    isError,
    isLoading,
    error,
    data,
    setData,
    clearCache: clearMutationCache,
    fetchData: fetchData,
  };
}
