import { AppBar, Box, Dialog, LinearProgress, Typography } from "@mui/material";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";
import { t } from "i18next";
import {
  Alert,
  GradientButton,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useQuery, useMutation } from "react-query";
import i18n from "components/multiLanguage/languagesConfiguration";
import { enqueueSnackbar } from "notistack";
import * as API from "./api";
import { useEffect, useRef } from "react";
import EnfinityLoader from "components/common/loader/EnfinityLoader";

const JrxmlDesign = ({ setMyData, rowData, title }) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const myRef = useRef<any>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery<any, any>(
    ["jrxmlDesignData", rowData?.DOC_CD],
    () =>
      API.jrxmlDesignData({
        DISPLAY_LANGUAGE: i18n,
        DOC_CD: rowData?.DOC_CD,
      }),
    {
      onError: (error: any) => {
        MessageBox({
          messageTitle: "Error",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
      },
      enabled: Boolean(rowData?.DOC_CD),
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["jrxmlDesignData"]);
    };
  }, []);

  // mutation for saving updates
  const updateMutation = useMutation(API.updateJrxmlDesignData, {
    onSuccess: () => {
      CloseMessageBox();
      enqueueSnackbar(t("DataUpdatedSuccessfully"), { variant: "success" });
      setMyData((old) => ({ ...old, isJrxmlOpen: false }));
    },
    onError: (err: any) => {
      CloseMessageBox();
      enqueueSnackbar(err?.error_msg ?? t("DataUpdationFailed"), {
        variant: "error",
      });
    },
  });

  return (
    <div>
      <Dialog fullScreen open={true}>
        {/* Top Bar */}
        <AppBar
          sx={{
            position: "relative",
            background: "var(--theme-color5)",
            color: "var(--theme-color2)",
            lineHeight: "40px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{ ml: 2, flex: 1, alignContent: "center" }}
              variant="h6"
              component="div"
            >
              {`${t("JRXMLDesign")} For ${title}`}
            </Typography>
            <Box>
              <GradientButton
                onClick={async () => {
                  let buttonName = await MessageBox({
                    messageTitle: "Confirmation",
                    message: "DoYouWantToUpdateThisTemplate",
                    icon: "CONFIRM",
                    buttonNames: ["Yes", "No"],
                    loadingBtnName: ["Yes"],
                    defFocusBtnName: "Yes",
                  });
                  if (buttonName === "Yes") {
                    updateMutation.mutate({
                      DOC_CD: rowData?.DOC_CD,
                      RPT_TEMPLATE: myRef.current,
                      REPORT_ID: data?.[0]?.REPORT_ID,
                      IS_UPDATE: "Y",
                    });
                  }
                }}
                color={"primary"}
              >
                {t("Update")}
              </GradientButton>
              <GradientButton
                onClick={() =>
                  setMyData((old) => ({ ...old, isJrxmlOpen: false }))
                }
                color="primary"
              >
                {t("Close")}
              </GradientButton>
            </Box>
          </Box>
        </AppBar>

        {/* Loading / Error Handling */}
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? t("Somethingwenttowrong")}
            errorDetail={error?.error_detail ?? ""}
            color="error"
          />
        )}

        {/* Editor */}
        <Box
          sx={{
            padding: "10px",
            height: "calc(100vh - 64px)",
            position: "relative",
          }}
        >
          <EnfinityLoader loading={isFetching || isLoading} />
          <AceEditor
            style={{
              height: "87vh",
              width: "100%",
              border: "1px solid #a39494",
            }}
            name={"jrxml-editor"}
            theme={"github"}
            mode={"xml"}
            key={rowData?.DOC_CD}
            fontSize={14}
            value={data?.[0]?.RPT_TEMPLATE}
            onChange={(value) => {
              myRef.current = value;
            }}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              useWorker: false,
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </Box>
      </Dialog>
    </div>
  );
};

export default JrxmlDesign;
