import { Notification } from "./notification";

import { AutoRefreshProvider } from "@acuteinfo/common-base";

export const NotificationWrapper = () => {
  return (
    <AutoRefreshProvider>
      <Notification />
    </AutoRefreshProvider>
  );
};
