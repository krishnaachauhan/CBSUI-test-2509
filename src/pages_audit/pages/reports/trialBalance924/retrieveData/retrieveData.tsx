import { useRef, useContext, useEffect } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import {
  Box,
  CircularProgress,
  Dialog,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { retrieveFormMetaData } from "./retrieveFormMetadata";
import { ClearCacheProvider, GradientButton } from "@acuteinfo/common-base";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
import { format } from "date-fns";

const RetrieveDataCustom = ({ setRetrieve, setRetrieveData }) => {
  const { authState } = useContext(AuthContext);

  const { MessageBox, CloseMessageBox } = usePopupContext();
  const formRef = useRef<any>(null);
  const { t } = useTranslation();

  const updateFnWrapper =
    (update) =>
    async ({ reqdata }) => {
      return update({
        ...reqdata,
      });
    };

  //API calling  for retrieve data
  const mutation: any = useMutation(
    "getRtgsData",
    updateFnWrapper(API.retrieveData),
    {
      onSuccess: (data, { endSubmit }: any) => {
        if (!data?.length) {
          endSubmit(false, t("NoDataFound") ?? "");
        } else if (Array.isArray(data) && data?.length > 0) {
          data[0].RETRIEVE_DATA = "Y";
          setRetrieveData(data);
          setRetrieve(false);
        }
      },
      onError: (error: any, { endSubmit }: any) => {
        let errorMsg = t("UnknownErrorOccured");
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        endSubmit(false, errorMsg, error?.error_detail ?? "");
      },
    }
  );

  // for shortcut-key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <>
      <>
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              maxWidth: "750px",
              padding: "5px",
              position: "relative",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
            }}
          >
            <EnfinityLoader
              loading={mutation?.isFetching || mutation?.isLoading}
            />
            <FormWrapper
              key={`retrieve-Form-924`}
              metaData={retrieveFormMetaData as MetaDataType}
              initialValues={{}}
              onSubmitHandler={async (data: any, displayData, endSubmit) => {
                endSubmit(true);

                let flagData: any = {};
                console.log("<<<flagData: ", flagData);

                const messagebox = async (msg) => {
                  let buttonName = await MessageBox({
                    messageTitle: "Confirmation",
                    message: msg,
                    buttonNames: ["Yes", "No"],
                    icon: "CONFIRM",
                  });
                  return buttonName;
                };

                let postData = [
                  {
                    O_STATUS: "99",
                    O_MESSAGE: "WanttogetcranddrbalanceautoGLhead",
                  },
                  {
                    O_STATUS: "9",
                    O_MESSAGE: "PrintNoofACinTrialBalance",
                  },
                  { O_STATUS: "0", O_MESSAGE: "Success" },
                ];

                for (let i = 0; i < postData?.length; i++) {
                  if (postData[i]?.O_STATUS !== "0") {
                    let btnName = await messagebox(postData[i]?.O_MESSAGE);
                    if (btnName === "Yes" && postData[i]?.O_STATUS === "99") {
                      flagData.MESSAGE1 = "Y";
                    } else if (
                      btnName === "No" &&
                      postData[i]?.O_STATUS === "99"
                    ) {
                      flagData.MESSAGE1 = "N";
                    } else if (
                      btnName === "Yes" &&
                      postData[i]?.O_STATUS === "9"
                    ) {
                      flagData.MESSAGE2 = "Y";
                    } else if (
                      btnName === "No" &&
                      postData[i]?.O_STATUS === "9"
                    ) {
                      flagData.MESSAGE2 = "N";
                    }
                  } else {
                    mutation.mutate({
                      reqdata: {
                        FROM_DT: data?.FROM_DT
                          ? format(new Date(data?.FROM_DT), "dd/MMM/yyyy")
                          : null,
                        PRINT_PROFIT_LOSS: data?.PRINT_PROFIT_LOSS ? "Y" : "N",
                        ...flagData,
                      },
                      endSubmit,
                    });
                  }
                }
              }}
              formStyle={{
                background: "white",
              }}
              controlsAtBottom={true}
              ref={formRef}
            >
              {({ isSubmitting, handleSubmit }) => (
                <Stack spacing={1.5} direction="row">
                  <GradientButton
                    color={"primary"}
                    onClick={(event) => handleSubmit(event, "BUTTON_CLICK")}
                    disabled={isSubmitting || mutation?.isLoading}
                  >
                    {t("Retrieve")}
                  </GradientButton>

                  <GradientButton
                    onClick={() => setRetrieve(false)}
                    color={"primary"}
                  >
                    {t("Cancel")}
                  </GradientButton>
                </Stack>
              )}
            </FormWrapper>
          </Box>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveData = ({ setRetrieve, setRetrieveData }) => {
  return (
    <ClearCacheProvider>
      <RetrieveDataCustom
        setRetrieve={setRetrieve}
        setRetrieveData={setRetrieveData}
      />
    </ClearCacheProvider>
  );
};
