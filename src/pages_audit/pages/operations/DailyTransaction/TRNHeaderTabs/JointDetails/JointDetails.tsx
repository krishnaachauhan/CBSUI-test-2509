import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";
import * as API from "./api";
import { JointDetailGridMetaData } from "./gridMetadata";

import {
  ActionTypes,
  Alert,
  GridMetaDataType,
  GridWrapper,
} from "@acuteinfo/common-base";
import { JointDetailsForm } from "./jointDetailsForm";
type JointDetailsCustomProps = {
  hideHeader?: any;
  reqData: any;
  height?: any;
  closeDialog?: any;
};
export const JointDetails: React.FC<JointDetailsCustomProps> = ({
  reqData,
  hideHeader,
  height,
  closeDialog,
}) => {
  const actions: ActionTypes[] = [
    {
      actionName: "ViewDetails",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
  ];
  const actions2: ActionTypes[] = [
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
    {
      actionName: "ViewDetails",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
  ];

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Index for navigation
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  // Fetch joint details from API
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getJointDetailsList", { reqData }],
    () => API.getJointDetailsList(reqData),
    {
      // enabled: !!reqData?.ACCT_CD, // Only fetch if ACCT_CD exists
      enabled: hasRequiredFields,
      onSuccess(data) {},
      onError(err) {},
    }
  );
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };

  // Action handler for grid
  const setCurrentAction = useCallback((data) => {
    if (data?.name === "close") {
      closeDialog();
      localStorage.removeItem("commonClass");
    } else {
      const index = data?.rows?.[0]?.data?.index;
      if (index !== undefined) {
        setCurrentIndex(index);
        setOpen(true); // Open dialog after setting the currentIndex
      }
    }
  }, []);

  //Grid Header title
  const memoizedMetadata = useMemo(() => {
    JointDetailGridMetaData.gridConfig.gridLabel = reqData?.custHeader
      ? `Joint Details of A/c No.: ${reqData?.BRANCH_CD?.trim() ?? ""}-${
          reqData?.ACCT_TYPE?.trim() ?? ""
        }-${reqData?.ACCT_CD?.trim() ?? ""} ${reqData?.ACCT_NM?.trim() ?? ""}`
      : reqData?.TAB_DISPL_NAME ?? "jointDetails";

    return JointDetailGridMetaData;
  }, [
    reqData?.custHeader,
    reqData?.BRANCH_CD,
    reqData?.ACCT_TYPE,
    reqData?.ACCT_CD,
  ]);

  JointDetailGridMetaData.gridConfig.containerHeight = {
    min: height ? height : "21.4vh",
    max: height ? height : "21.4vh",
  };
  localStorage.setItem("commonClass", "joint");
  return (
    <>
      {isError && (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Something went to wrong."}
          errorDetail={error?.error_detail ?? ""}
        />
      )}
      <div className="joint">
        <GridWrapper
          key={`JointDetailGridMetaData`}
          finalMetaData={memoizedMetadata as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          hideHeader={hideHeader}
          actions={reqData?.BTN_FLAG === "Y" ? actions2 : actions}
          setAction={setCurrentAction}
          refetchData={handleRefetch}
          loading={isLoading || isFetching}
          enableExport={true}
        />
      </div>

      {open ? (
        <JointDetailsForm
          isOpen={open}
          reqData={reqData}
          index={currentIndex}
          data={data}
          closeDialog={() => setOpen(false)}
        />
      ) : null}
    </>
  );
};
