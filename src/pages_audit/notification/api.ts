import { AuthSDK } from "registry/fns/auth";

export const getNotificationList = async () => {
  const { data, status } = await AuthSDK.internalFetcher(
    `./user/notification`,
    {
      body: JSON.stringify({
        request_data: {},
        channel: "W",
      }),
    }
  );
  if (status === "success") {
    return data?.response_data;
  } else {
    throw data?.error_data;
  }
};

export const submitNotification = async ({ activityID, readFlag }: any) => {
  const { data, status } = await AuthSDK.internalFetcher(
    `./user/notification-read-flag-update`,
    {
      body: JSON.stringify({
        request_data: { activityID: activityID, readFlag: readFlag },
        channel: "W",
      }),
    }
  );
  if (status === "success") {
    return data?.response_data;
  } else {
    throw data?.error_data;
  }
};
