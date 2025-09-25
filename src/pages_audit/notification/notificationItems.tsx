import { useState, Fragment } from "react";
import { useMutation } from "react-query";
import { validateDate } from "./fns";
import * as API from "./api";
import { Badge, Divider, ListItem, Typography } from "@mui/material";

interface notificationDataType {
  activityID: string;
  readFlag: string;
}

const notificationDataWrapperFn =
  (notificationData) =>
  async ({ activityID, readFlag }: notificationDataType) => {
    return notificationData({ activityID, readFlag });
  };

export const NotificationItems = ({
  flag,
  description,
  readFlag,
  setNotificationAsRead,
  setNotificationAsUnRead,
  activityDate,
  activityID,
}) => {
  const [read, setRead] = useState(readFlag === "Yes" ? true : false);

  const readNotification = useMutation(
    notificationDataWrapperFn(API.submitNotification),
    {
      onSuccess: () => {
        setNotificationAsRead();
        setRead(true);
      },
    }
  );

  const unReadNotification = useMutation(
    notificationDataWrapperFn(API.submitNotification),
    {
      onSuccess: () => {
        setNotificationAsUnRead();
        setRead(false);
      },
    }
  );

  return (
    <Fragment>
      <ListItem
        onClick={() => {
          if (read === false) {
            readNotification.mutate({ activityID: activityID, readFlag: "Y" });
          } else {
            unReadNotification.mutate({
              activityID: activityID,
              readFlag: "N",
            });
          }
        }}
        style={{
          padding: "0px 8px",
          backgroundColor: read === false ? "#89c5a72e" : "inherit",
        }}
        button
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <Typography variant="h6" component="div">
            <span>{flag}</span>
          </Typography>
          <Typography variant="body1">{description}</Typography>
          <Typography
            variant="body2"
            style={
              read === true
                ? { color: "rgba(0, 0, 0, 0.54)" }
                : { color: "#0063a3" }
            }
          >
            {validateDate(activityDate)}
          </Typography>
        </div>
        {read === false ? (
          <Badge
            color="secondary"
            badgeContent=" "
            overlap="circular"
            variant="dot"
            style={{ right: "20px", top: "15px", position: "absolute" }}
          />
        ) : null}
      </ListItem>

      <Divider variant="inset" component="div" style={{ marginLeft: "0px" }} />
    </Fragment>
  );
};
