import { FC, useRef, useCallback } from "react";
import { useMutation } from "react-query";
import * as API from "./api";
import { Dialog } from "@mui/material";
import { t } from "i18next";
import {
  ActionTypes,
  ClearCacheProvider,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useNavigate } from "react-router-dom";
import { PaySlipIssueEntry } from "../paySlipIssueEntryGrid";
import { Payslipissueconfirmation } from "../../payslipissueconfirmation/payslipissueconfirmationGrid";
import { RetrievalDefaultContent } from "./retrievalScreen";
export const FullScreenDialog: FC<{
  open: boolean;
  children: React.ReactNode;
}> = ({ open, children }) => (
  <Dialog
    open={open}
    PaperProps={{
      style: { overflow: "hidden", height: "100vh" },
    }}
    fullScreen
    maxWidth="xl"
  >
    {children}
  </Dialog>
);

const actions: ActionTypes[] = [
  {
    actionName: "view-detail",
    actionLabel: t("ViewDetails"),
    multiple: false,
    rowDoubleClick: true,
  },
];

export const RetriveGridForm: FC<{
  screenFlag: string;
  headerLabel: string;
  opem: boolean;
  apiReqFlag: string;
  close(): void;
  trans_type: string;
}> = ({ screenFlag, opem, close, headerLabel, apiReqFlag, trans_type }) => {
  const formRef = useRef<any>(null);
  const indexRef = useRef(0);
  const navigate = useNavigate();
  const { MessageBox } = usePopupContext();

  const setCurrentAction = useCallback((data) => {
    if (data?.name === "view-detail") {
      indexRef.current = Number(data?.rows?.[0].id);
      navigate("view-detail", {
        state: {
          gridData: data?.rows?.[0]?.data,
          index: indexRef.current,
          formMode: "view",
        },
      });
    }
  }, []);

  const mutation: any = useMutation(API.retRiveGridData, {
    onSuccess: () => {},
    onError: async (error: any) => {
      await MessageBox({
        message: error?.error_msg,
        messageTitle: "Error",
        icon: "ERROR",
        buttonNames: ["Ok"],
      });
    },
  });

  const handlePrev = useCallback(() => {
    if (indexRef.current > 1) {
      indexRef.current -= 1;
      const index = indexRef.current;
      setTimeout(() => {
        setCurrentAction({
          name: "view-detail",
          rows: [{ data: mutation?.data[index - 1], id: String(index) }],
        });
      }, 0);
      navigate(".");
    }
  }, [mutation?.data]);

  const handleNext = useCallback(() => {
    const index = indexRef.current++;
    setTimeout(() => {
      setCurrentAction({
        name: "view-detail",
        rows: [{ data: mutation?.data[index], id: String(index + 1) }],
      });
    }, 0);
  }, [mutation?.data]);

  const renderContent = () => {
    switch (apiReqFlag) {
      case "RPT/15":
        return <Payslipissueconfirmation onClose={close} />;
      case "RPT/14":
        return <PaySlipIssueEntry onClose={close} />;
      default:
        return (
          <RetrievalDefaultContent
            close={close}
            formRef={formRef}
            mutation={mutation}
            actions={actions}
            setCurrentAction={setCurrentAction}
            headerLabel={headerLabel}
            screenFlag={screenFlag}
            indexRef={indexRef}
            handlePrev={handlePrev}
            handleNext={handleNext}
            apiReqFlag={apiReqFlag}
            trans_type={trans_type}
          />
        );
    }
  };

  return <FullScreenDialog open={true}>{renderContent()}</FullScreenDialog>;
};

export const RetrieveEntryGrid = (props) => (
  <ClearCacheProvider>
    <RetriveGridForm {...props} />
  </ClearCacheProvider>
);
