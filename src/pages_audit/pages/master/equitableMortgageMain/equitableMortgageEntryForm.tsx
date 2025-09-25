import { Dialog } from "@mui/material";
import { MortgageContext, MortgageContextWrapper } from "./mortgageContext";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ClearCacheProvider,
  LoaderPaperComponent,
  queryClient,
} from "@acuteinfo/common-base";
import { Box } from "@mui/system";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import * as API from "./api";
import { useQueries } from "react-query";
import {
  ActionHeader,
  ContainerBox,
  MortgageStepper,
  StepperActions,
  stickyHeaderBox,
} from "./helper";
import StepperContent from "./stepperContent";

const MortGageEntryForm = ({ closeDialog, defaultView, isDataChangedRef }) => {
  const {
    dataState,
    setActiveStep,
    setIsBackButton,
    updateHeaderEntryData,
    updateMortgageEntryData,
    updateParaValue,
    updatePropertyHolderDataData,
    setAllUpdatedShareAcctDtl,
  } = useContext(MortgageContext);

  const { authState } = useContext(AuthContext);
  const [formMode, setFormMode] = useState(defaultView);
  const headerDTLformref = useRef<any>(null);
  const mortgageDTLformref = useRef<any>(null);
  const finalRef = useRef<any>(null);
  const filteredArray = useRef<any[]>([]);
  const { state: rows }: any = useLocation();

  useEffect(() => {
    updateHeaderEntryData({ ...rows?.[0]?.data });
  }, [rows]);
  const [collectedRows, setCollectedRows] = useState([]);

  useEffect(() => {
    finalRef.current = dataState?.propertyHoldersData?.PROPERTY_DETAILS;
    setCollectedRows(dataState?.propertyHoldersData?.PROPERTY_DETAILS);
  }, [dataState]);

  const results = useQueries([
    {
      queryKey: ["getEquitablePara"],
      queryFn: () =>
        API.getEquiyablePara({
          COMP_CD: authState?.companyID,
          BRANCH_CD: authState?.user?.branchCode,
        }),
      onSuccess: (data) => {
        updateParaValue(data);
      },
    },
    {
      queryKey: ["getEquitableMortgageDetails"],
      queryFn: () =>
        API.getEquitableMortgageDetails({
          COMP_CD: authState?.companyID,
          TRAN_CD: rows?.[0]?.data?.TRAN_CD,
        }),
      enabled: Boolean(rows?.[0]?.data?.TRAN_CD),
      onSuccess: (data) => {
        updateMortgageEntryData(data);
      },
    },
    {
      queryKey: ["getPropertyHolderDetails"],
      queryFn: () =>
        API.getPropertyHolderDetails({
          COMP_CD: authState?.companyID,
          TRAN_CD: rows?.[0]?.data?.TRAN_CD,
        }),
      enabled: Boolean(rows?.[0]?.data?.TRAN_CD),
      onSuccess: (data) => {
        const groupedData = data?.reduce((acc, dt) => {
          const srCd = dt?.SR_CD;
          if (srCd) {
            if (!acc[srCd]) {
              acc[srCd] = [];
            }
            acc[srCd].push(dt);
          }
          return acc;
        }, {});

        setAllUpdatedShareAcctDtl(groupedData);
      },
    },
    {
      queryKey: ["getMortgageDetails"],
      queryFn: () =>
        API.getMortgageDetails({
          COMP_CD: authState?.companyID,
          TRAN_CD: rows?.[0]?.data?.TRAN_CD,
        }),
      enabled: !!rows?.[0]?.data?.TRAN_CD,
      onSuccess: (data) => {
        updatePropertyHolderDataData(data);
      },
    },
  ]);

  const [
    {
      data: paraValue,
      isLoading: paraValueLoading,
      isError: isParaValueError,
      error: paraValueError,
    },
    {
      data: detailData,
      isLoading: detailDataLoading,
      isError: isDetailDataError,
      error: detailDataError,
    },
    {
      data: propHoldrDetail,
      isLoading: propHoldrDetailLoading,
      isError: ispropHoldrDetailError,
      error: propHoldrDetailError,
    },
    {
      data: mortgageDetails,
      isLoading: mortgageDetailsLoading,
      isError: ismortgageDetailsError,
      error: mortgageDetailsError,
    },
  ] = results;

  const handleComplete = async (e) => {
    if (dataState.activeStep === 0) {
      if (formMode !== "view") {
        await headerDTLformref.current?.handleSubmit(e);
      } else {
        setActiveStep(dataState?.activeStep + 1);
      }
    } else if (dataState.activeStep === 1) {
      if (formMode !== "view") {
        await mortgageDTLformref.current?.handleSubmit(e);
      } else {
        setActiveStep(dataState?.activeStep + 1);
      }
    }
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getMortgageDetails"]);
      queryClient.removeQueries(["getPropertyHolderDetails"]);
      queryClient.removeQueries(["getEquitableMortgageDetails"]);
    };
  }, []);

  const errorDataa: any = [
    { error: paraValueError, isError: isParaValueError },
    { error: detailDataError, isError: isDetailDataError },
    { error: propHoldrDetailError, isError: ispropHoldrDetailError },
    { error: mortgageDetailsError, isError: ismortgageDetailsError },
  ];

  return (
    <Dialog
      open={true}
      className="form"
      maxWidth="xl"
      PaperProps={{
        style: ContainerBox,
      }}
    >
      {!paraValueLoading &&
      !mortgageDetailsLoading &&
      !detailDataLoading &&
      !propHoldrDetailLoading ? (
        <>
          <Box>
            <Box sx={stickyHeaderBox}>
              <ActionHeader
                formMode={formMode}
                setFormMode={setFormMode}
                mortgageDTLformref={mortgageDTLformref}
                closeDialog={closeDialog}
                handleComplete={handleComplete}
              />
              <MortgageStepper
                activeStep={dataState?.activeStep}
                errorData={errorDataa}
              />
            </Box>

            <StepperContent
              defaultView={defaultView}
              formMode={formMode}
              headerDTLformref={headerDTLformref}
              mortgageDTLformref={mortgageDTLformref}
              paraValue={paraValue}
              collectedRows={collectedRows}
              detailData={detailData}
              propHoldrDetail={propHoldrDetail}
              mortgageDetails={mortgageDetails}
              finalRef={finalRef}
              closeDialog={closeDialog}
              filteredArray={filteredArray}
              isDataChangedRef={isDataChangedRef}
            />
          </Box>

          <StepperActions
            formMode={formMode}
            activeStep={dataState?.activeStep}
            handleComplete={handleComplete}
            mortgageDTLformref={mortgageDTLformref}
            setActiveStep={setActiveStep}
            setIsBackButton={setIsBackButton}
            updateMortgageEntryData={updateMortgageEntryData}
          />
        </>
      ) : (
        <LoaderPaperComponent />
      )}
    </Dialog>
  );
};
export const EquitableMortgageForm = ({
  closeDialog,
  defaultView,
  isDataChangedRef,
}) => {
  return (
    <ClearCacheProvider>
      <MortgageContextWrapper>
        <MortGageEntryForm
          closeDialog={closeDialog}
          defaultView={defaultView}
          isDataChangedRef={isDataChangedRef}
        />
      </MortgageContextWrapper>
    </ClearCacheProvider>
  );
};
