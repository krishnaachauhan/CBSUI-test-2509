import {
  FC,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CardRateMstFormMetaData } from "./metaData";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { useSnackbar } from "notistack";
import { format } from "date-fns";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  RemarksAPIWrapper,
  ActionTypes,
  queryClient,
  usePopupContext,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import getDynamicLabel from "components/common/custom/getDynamicLabel";
import { Theme } from "@mui/system";
import { makeStyles } from "@mui/styles";
import CardRateMstTable from "./cardRateMstTable";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: t("ViewDetail"),
    multiple: undefined,
    rowDoubleClick: true,
  },
  {
    actionName: "close",
    actionLabel: t("Close"),
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];
const useTypeStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    background: "var(--theme-color5)",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
  refreshiconhover: {},
}));
const CardRatemasterForm: FC<{}> = () => {
  const { t } = useTranslation();
  const { authState } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [formMode, setFormMode] = useState("new");
  const [isOpenRetrieve, setIsOpenRetrieve] = useState(false);
  const [gridData, setGridData] = useState<any>([]);
  const [isDeleteRemark, SetDeleteRemark] = useState(false);

  const myFormRef: any = useRef(null);

  const retrieveDataRef: any = useRef(null);
  const gridApi: any = useRef(null);
  let currentPath = useLocation().pathname;

  let { data, isLoading: isSlipLoading } = useQuery(
    ["getCardRateData", formMode],
    () =>
      API.getRetrievalCardRateData({
        FROM_DT: format(new Date(authState?.workingDate ?? ""), "dd/MMM/yyyy"),
        TO_DT: format(new Date(authState?.workingDate ?? ""), "dd/MMM/yyyy"),
      })
  );
  useEffect(() => {
    setGridData(data);
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getCardRateData", formMode]);
    };
  }, [formMode]);

  const getCardRateData: any = useMutation(API.getCardRateDtl, {
    onSuccess: (data) => {
      setGridData(data);
    },
    onError: (error: any) => {
      console.log("err", error);
    },
  });

  const handleCustomCellKeyDown = useCallback(async (params, lastColumn) => {
    const {
      event,
      column: { colDef },
      api,
      node,
      value,
      context,
    } = params;
  }, []);

  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.ctrlKey && (event?.key === "R" || event?.key === "r")) {
        event.preventDefault();
        setIsOpenRetrieve(true);
      } else if (formMode === "view") {
        if (event.ctrlKey && (event?.key === "D" || event?.key === "d")) {
          event.preventDefault();
          if (
            retrieveDataRef.current?.CONFIRMED === "Y" &&
            authState?.role < "2"
          ) {
            await MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("CannotDeleteConfirmedTransaction"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
          } else if (
            new Date(retrieveDataRef.current?.TRAN_DT) <
            new Date(authState?.workingDate)
          ) {
            await MessageBox({
              messageTitle: t("ValidationFailed"),
              message: t("CannotDeleteBackDatedEntry"),
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
          } else {
            SetDeleteRemark(true);
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }, [formMode]);
  CardRateMstFormMetaData.form.label = getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );
  return (
    <Fragment>
      {
        <>
          <div>
            <CardRateMstTable
              gridApi={gridApi}
              defaultView={formMode}
              formState={myFormRef}
              authState={authState}
              data={gridData}
              getCardRateData={getCardRateData}
              handleCustomCellKeyDown={handleCustomCellKeyDown}
            />
          </div>
          {isDeleteRemark && (
            <RemarksAPIWrapper
              TitleText={t("EnterRemovalRemarksINWARDRETURNENTRY")}
              onActionNo={() => SetDeleteRemark(false)}
              onActionYes={async (val, rows) => {
                const buttonName = await MessageBox({
                  messageTitle: t("Confirmation"),
                  message: t("DoYouWantDeleteRow"),
                  buttonNames: ["Yes", "No"],
                  defFocusBtnName: "Yes",
                  loadingBtnName: ["Yes"],
                  icon: "CONFIRM",
                });
              }}
              isEntertoSubmit={true}
              AcceptbuttonLabelText="Ok"
              CanceltbuttonLabelText="Cancel"
              open={isDeleteRemark}
              rows={undefined}
            />
          )}
        </>
        //)
      }
    </Fragment>
  );
};

export const CardRateMasterFormWrapper = () => {
  return (
    <ClearCacheProvider>
      <CardRatemasterForm />
    </ClearCacheProvider>
  );
};
