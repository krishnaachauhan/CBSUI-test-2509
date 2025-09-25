import {
  ActionTypes,
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  GridWrapper,
  MetaDataType,
  SubmitFnType,
  usePopupContext,
} from "@acuteinfo/common-base";
import * as API from "./api";
import { useMutation } from "react-query";
import { gridMetadata } from "./gridMetaData";
import { AppBar, Dialog, Toolbar, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";
import { t } from "i18next";
import { searchAccountDataFormMetaData } from "./metaData";

const actions: ActionTypes[] = [
  {
    actionName: "view-all",
    actionLabel: "ViewAll",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "close-dbl",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: false,
    rowDoubleClick: true,
  },
];

const SearchAcctGrid = ({ open, close, reqPara }) => {
  const [actionMenu, setActionMenu] = useState(actions);
  const [activeSiFlag, setActiveSiFlag] = useState("Y"); // "Y" for View All, "N" for View Pending or Close
  const formRef = useRef<any>(null);
  const [filteredData, setFilteredData] = useState([]);
  const { MessageBox } = usePopupContext();

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      close();
      setActiveSiFlag("N");
    } else if (data?.name === "view-all") {
      setActionMenu((values) =>
        values.map((item) =>
          item.actionName === "view-all"
            ? { ...item, actionName: "view-Open", actionLabel: "View Open" }
            : item
        )
      );
      setActiveSiFlag("N");
    } else if (data?.name === "view-Open") {
      setActionMenu((values) =>
        values.map((item) =>
          item.actionName === "view-Open"
            ? { ...item, actionName: "view-all", actionLabel: "viewAll" }
            : item
        )
      );
      setActiveSiFlag("Y");
    } else if (data?.name === "close-dbl") {
      console.log(data, data?.rows[0]?.data?.ACCT_CD);
      close(data?.rows[0]?.data?.ACCT_CD);
    }
  }, []);

  const mutation: any = useMutation(API.getAccountsOnF5, {
    onSuccess: () => {},
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      MessageBox({
        messageTitle: "ValidationFailed",
        message: errorMsg ?? "Something went wrong!",
        icon: "ERROR",
      });
    },
  });

  useEffect(() => {
    return () => {
      localStorage.removeItem("commonClass");
    };
  }, []);

  useEffect(() => {
    const filteredData =
      mutation?.data?.filter((item) => {
        if (activeSiFlag === "Y") {
          return item.DEFALUT_VIEW === "Y";
        }
        return true;
      }) ?? [];
    setFilteredData(filteredData);
  }, [mutation?.data, activeSiFlag]);

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit
  ) => {
    endSubmit(true);
    if (!data?.COL_NM || !data?.COL_VAL) {
      MessageBox({
        messageTitle: "ValidationFailed",
        message: "Please Enter any parameter value to search.",
        icon: "ERROR",
      });
      return;
    }
    mutation.mutate(data);
  };
  return (
    <Dialog
      open={open}
      className="acctGrid"
      PaperComponent={PaperComponent}
      id="draggable-dialog-title"
      aria-labelledby="draggable-dialog-title"
      PaperProps={{
        style: {
          maxWidth: "100%",
        },
      }}
      maxWidth="xl"
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          localStorage.removeItem("commonClass");
          close();
        }
      }}
    >
      <div id="draggable-dialog-title" style={{ cursor: "move" }}>
        <AppBar
          position="static"
          sx={{
            background: "var(--theme-color5)",
            width: "auto",
            margin: "10px 10px 0px 10px",
          }}
        >
          <Toolbar
            sx={{
              paddingLeft: "24px",
              paddingRight: "24px",
              minHeight: "48px !important",
            }}
          >
            <Typography
              component="span"
              variant="h5"
              sx={{
                flex: "1 1 100%",
                color: "var(--theme-color2)",
                fontSize: "1.25rem",
                letterSpacing: "0.0075em",
              }}
            >
              {t("SearchAccountMaster")}
            </Typography>
            <div style={{ display: "flex", alignItems: "center" }}>
              <GradientButton onClick={() => close()}>
                {t("Close")}
              </GradientButton>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <div
        onKeyDown={async (e: any) => {
          if (e.key !== "Enter") return;
          if (!e.target?.value?.trim()) return;
          e.preventDefault();
          formRef?.current?.handleSubmit(e, "save");
        }}
      >
        <FormWrapper
          key={`searchAcctData`}
          metaData={searchAccountDataFormMetaData as MetaDataType}
          initialValues={reqPara}
          subHeaderLabel="Search Account Master"
          onSubmitHandler={onSubmitHandler}
          formStyle={{
            background: "white",
            padding: "2px 10px 0px 10px",
          }}
          hideHeader={true}
          onFormButtonClickHandel={() => {
            let event: any = { preventDefault: () => {} };
            formRef?.current?.handleSubmit(event, "BUTTON_CLICK");
          }}
          // onFormButtonCicular={mutation.isLoading}
          ref={formRef}
        >
          {/* {() => (
            <GradientButton
              onClick={() => {
                close();
              }}
              color={"primary"}
              // ref={formbtnRef}
              endicon="CancelOutlined"
              rotateIcon="scale(1.4) rotate(360deg)"
              sx={{
                background: "transparent !important",
                color: "var(--theme-color2) !important",
                boxShadow: "none !important",
                fontSize: "14px",
                "&:hover": {
                  background: "rgba(235, 237, 238, 0.45) !important",
                  // color: "var(--theme-color2) !important",
                  // border: "1.5px solid var(--theme-color2)",
                  transition: "all 1s ease 0s",
                  "& .MuiSvgIcon-root": {
                    transform: "scale(1.4) rotateY(360deg)",
                    transition: "transform 2s ease-in-out",
                  },
                },
              }}
            >
              {t("Close")}
            </GradientButton>
          )} */}
        </FormWrapper>
      </div>
      <div style={{ padding: "0px 10px 10px 10px" }}>
        <GridWrapper
          key={"modeMasterGrid" + activeSiFlag}
          finalMetaData={gridMetadata}
          data={filteredData}
          setData={() => null}
          actions={actionMenu}
          loading={mutation?.isLoading || mutation?.isFetching}
          setAction={setCurrentAction}
          // refetchData={() => refetch()}
          variant="contained"
        />
      </div>
    </Dialog>
  );
};

export const SearchAcctGridMain = ({ open, close, reqPara }) => {
  useEffect(() => {
    if (open) {
      localStorage.setItem("commonClass", "acctGrid");
    }
  }, [open]);
  return (
    <ClearCacheProvider>
      <SearchAcctGrid reqPara={reqPara} open={open} close={close} />
    </ClearCacheProvider>
  );
};
