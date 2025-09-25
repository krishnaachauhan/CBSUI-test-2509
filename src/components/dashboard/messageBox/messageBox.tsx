import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import { useQuery, useMutation, useQueries } from "react-query";
import * as API from "../api";
import { AuthContext } from "pages_audit/auth";
import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { ListPopupMessageWrapper } from "./listPopupBox/listPopupBox";
import { useTranslation } from "react-i18next";
import StickyNotes from "./stickyNotes/stickyNotes";
import { TipsWrapper } from "./tipsBox/tipsBoxWrapper";
import {
  AlertMessageBox,
  AnnouncementMessageBox,
  NotesMessageBox,
  TipsMessageBox,
} from "assets/icons/svgIcons";
import { queryClient } from "@acuteinfo/common-base";

export const MessageBox = ({ screenFlag = "" }: any) => {
  const [toggle, setToggle] = useState(false);
  const { authState } = useContext<any>(AuthContext);
  const [isOpenSave, setIsOpenSave] = useState(false);
  const { t } = useTranslation();
  const refData = useRef<any>(null);
  const isDataChangedRef = useRef(false);
  const result = useQueries([
    {
      queryKey: ["getDashboardMessageBoxData", screenFlag],
      queryFn: () =>
        API.getDashboardMessageBoxData({
          screenFlag,
          userID: authState?.user?.id ?? "",
        }),
    },
    {
      queryKey: ["getNoteCountData"],
      queryFn: () =>
        API.getNoteCountData({
          COMP_CD: authState?.companyID ?? "",
          userID: authState?.user?.id ?? "",
        }),
    },
  ]);

  const dataLength = result?.[0]?.isLoading ? (
    <CircularProgress size={20} thickness={4.6} />
  ) : (
    result?.[0]?.data?.length || "0"
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getDashboardMessageBoxData",
        {
          screenFlag,
          userID: authState?.user?.id ?? "",
        },
      ]);
      queryClient.removeQueries(["getNoteCountData"]);
    };
  }, []);

  const handleClick = () => {
    if (screenFlag === "Notes") {
      setIsOpenSave(true);
      // return;
    } else {
      setToggle(!toggle);
    }
  };

  const getDataNoteLength = useCallback(() => {
    if (result?.[1]?.isLoading) {
      return <CircularProgress size={20} thickness={4.6} />;
    }
    return result?.[1]?.data?.[0]?.CNT || "0";
  }, [result]);

  // Usage
  const dataNoteLength = getDataNoteLength();

  const handleDialogClose = useCallback(() => {
    if (isDataChangedRef.current === true) {
      isDataChangedRef.current = true;
      screenFlag === "Notes" ? result?.[1]?.refetch() : result?.[0]?.refetch();
    }
    isDataChangedRef.current = false;
    setIsOpenSave(false);
  }, []);
  const handleLabelClick = (item) => {
    refData.current = item;
    if (screenFlag === "Notes") {
      setIsOpenSave(false);
    } else {
      setIsOpenSave(true);
    }
  };
  return (
    <>
      <Grid>
        <Box
          sx={{
            height: "auto",
            backgroundColor:
              screenFlag === "Announcement"
                ? "var(--theme-color4)"
                : screenFlag === "Notes"
                ? "#E2ECFD"
                : screenFlag === "Tips"
                ? "#EDE7FD"
                : screenFlag === "Alert"
                ? "#FFE5EB"
                : null,
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "9px",
            cursor: "pointer",
          }}
          onClick={handleClick}
        >
          <Grid item xl={12} lg={8} xs={12} sm={6} md={4}>
            <Typography
              // gutterBottom
              // variant="overline"
              style={{
                color: "#black",
                fontSize: "20px",
                fontWeight: "500",
                lineHeight: "24px",
                letterSpacing: "0.01em",
                marginBottom: "4px",
              }}
            >
              {`${t(screenFlag)}`}
            </Typography>
            <Typography
              variant="h3"
              style={{
                fontSize: "15px",
                fontWeight: "500",
                color: "#949597",
                lineHeight: "27px",
              }}
            >
              {/* {`${body}`} */}
              {screenFlag === "Announcement"
                ? t("AnnouncingNewFeatures")
                : screenFlag === "Tips"
                ? t("BePreaparedForFruad")
                : screenFlag === "Notes"
                ? t("CustomerQueriesSolve")
                : screenFlag === "Alert"
                ? t("LowBalanceAlert")
                : null}
              {/* {`${result?.data?.[0]?.BOX_BODY ?? body}`} */}
            </Typography>
          </Grid>

          <Grid
            style={{ display: "flex", justifyContent: "end" }}
            item
            xs={12}
            sm={6}
            md={4}
          >
            <Box
              sx={{
                height: "38px",
                width: "38px",
                backgroundColor: "var(--theme-color3)",
                color: "var(--theme-color2)",
                borderRadius: "12px",
                padding: "10px",
                // margin: "4px 14px 0 0",
                margin: "auto",
                fontWeight: 600,
                textAlign: "center",
                boxShadow:
                  "rgba(0, 0, 0, 0.07) 0px 1px 1px, rgba(0, 0, 0, 0.07) 0px 2px 2px, rgba(0, 0, 0, 0.07) 0px 4px 4px, rgba(0, 0, 0, 0.07) 0px 8px 8px, rgba(0, 0, 0, 0.07) 0px 16px 16px",
                "&:hover": {
                  fontSize: "20px",
                  padding: "7px",
                },
              }}
            >
              {screenFlag === "Announcement"
                ? dataLength
                : screenFlag === "Tips"
                ? dataLength
                : screenFlag === "Notes"
                ? dataNoteLength
                : screenFlag === "Alert"
                ? dataLength
                : null}
            </Box>
            <IconButton
              color="inherit"
              style={{
                backgroundColor: "var(--theme-color2)",
                borderRadius: "10px",
                border: "0.4px solid rgba(66, 99, 199, 0.4)",
                boxShadow: "0px 5px 14px rgba(66, 99, 199, 0.2)",
                height: "45px",
                width: "45px",
              }}
              sx={{
                "& svg": {
                  display: "block",
                },
              }}
            >
              {/* {`${icon}`} */}

              {screenFlag === "Announcement" ? (
                // <VolumeUpRoundedIcon
                //   style={{ color: " #4263C7", fontSize: "30px" }}
                // />
                <AnnouncementMessageBox width={30} height={30} />
              ) : screenFlag === "Tips" ? (
                // <TipsAndUpdatesOutlinedIcon
                //   style={{ color: "#885CF5", fontSize: "30px" }}
                // />
                <TipsMessageBox width={30} height={30} />
              ) : screenFlag === "Notes" ? (
                <>
                  {/* <EventNoteOutlinedIcon
                    style={{ color: " #5290F5", fontSize: "30px" }}
                  /> */}
                  {/* <AddIcon
                    style={{ color: " #5290F5", fontSize: "30px" }}
                    // onClick={(e) => {
                    //   setIsOpenSave(true);
                    //   // setToggle(!toggle);
                    // }}
                  /> */}
                  <NotesMessageBox width={26} height={30} />
                  {/* <ReactStickyNotes onChange={handleOnChange} /> */}
                </>
              ) : screenFlag === "Alert" ? (
                // <WarningAmberRoundedIcon
                //   style={{ color: " #FF4F79", fontSize: "30px" }}
                // />
                <AlertMessageBox width={30} height={30} />
              ) : null}
            </IconButton>
            {/* {screenFlag === "Notes" ? (
              <Box
                sx={{
                  height: "38px",
                  width: "38px",
                  backgroundColor: "var(--theme-color3)",
                  color: "var(--theme-color2)",
                  borderRadius: "12px",
                  padding: "4px",
                  margin: "4px 0 0 4px",
                }}
              >
                <AddIcon
                  // style={{ fontSize: "30px" }}
                  onClick={(e) => {
                    setIsOpenSave(true);
                  }}
                />
              </Box>
            ) : null} */}
          </Grid>
        </Box>
      </Grid>

      {toggle ? (
        <>
          {result?.[0]?.isLoading || result?.[0]?.isFetching ? (
            <LoaderPaperComponent />
          ) : result?.[0]?.data?.length > 0 ? ( // Check if data exists
            <Grid item xs={12} sm={12} md={12} style={{ margin: "5px" }}>
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "background.paper",
                  height: "25vh",
                  overflowY: "auto",
                  borderRadius: "10px",
                  boxShadow: "0px 11px 20px rgba(226, 236, 249, 0.5)",
                }}
              >
                <nav aria-label="main mailbox folders">
                  <List
                    style={{
                      paddingTop: "0px",
                      paddingBottom: "0px",
                    }}
                  >
                    {result?.[0]?.data.map((item, _index) => (
                      <ListItemData
                        key={"listItemforannounce" + _index}
                        name={item?.DESCRIPTION}
                        onClick={() => {
                          handleLabelClick(item);
                        }}
                        selected={undefined}
                      />
                    ))}
                  </List>
                </nav>
              </Box>
            </Grid>
          ) : (
            setToggle(false)
          )}
        </>
      ) : null}
      {screenFlag === "Announcement" ? (
        <>
          {isOpenSave ? (
            <ListPopupMessageWrapper
              closeDialog={handleDialogClose}
              dialogLabel={refData.current?.DESCRIPTION}
              transactionID={refData.current?.TRAN_CD}
              open={undefined}
              formView={"view"}
              screenFlag={screenFlag}
              isDataChangedRef={isDataChangedRef}
              isAnnouncementLoading={
                result?.[0]?.isLoading || result?.[0]?.isFetching
              }
            />
          ) : null}
        </>
      ) : screenFlag === "Notes" ? (
        <>
          {isOpenSave ? (
            <StickyNotes
              open={isOpenSave}
              closeDialog={handleDialogClose}
              isDataChangedRef={isDataChangedRef}
            />
          ) : null}
        </>
      ) : screenFlag === "Tips" ? (
        <>
          {isOpenSave ? (
            <TipsWrapper
              open={isOpenSave}
              closeDialog={handleDialogClose}
              data={refData.current}
              formView={"view"}
              isLoading={result?.[0]?.isLoading || result?.[0]?.isFetching}
              isDataChangedRef={isDataChangedRef}
            />
          ) : null}
        </>
      ) : null}
      {/* {isOpenSave && (
        <StickyNotes
          closeDialog={handleDialogClose}
          dialogLabel={data}
          open={isOpenSave}
        />
      )} */}
    </>
  );
};
export const ListItemData = ({ name, selected, onClick }) => {
  //@ts-ignore

  return (
    <div>
      <ListItem
        button
        style={{
          padding: "8px 0 0 35px",
          color: "black",
          fontSize: "15px",
          backgroundColor: selected ? "#0000ff87" : "transparent",
        }}
        onClick={onClick}
      >
        <ListItemText primary={name} />
      </ListItem>
    </div>
  );
};
