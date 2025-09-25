import { SlipJoinDetailGridMetaData } from "./paySlipMetadata";
import { useCallback } from "react";
import {
  LoaderPaperComponent,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "Close",
    actionLabel: "Close",
    multiple: false,
    alwaysAvailable: true,
    rowDoubleClick: false,
  },
];

function JointDetails({ data, onClose, loading, hideHeader }) {
  const setCurrentAction = useCallback(async (data) => {
    if (data.name === "Close") {
      onClose(false);
    }
  }, []);
  return (
    <div>
      {!loading ? (
        <GridWrapper
          key={"modeMasterGrid"}
          finalMetaData={SlipJoinDetailGridMetaData as GridMetaDataType}
          data={data ?? []}
          setData={() => null}
          hideHeader={hideHeader}
          loading={loading}
          setAction={setCurrentAction}
          actions={actions}
        />
      ) : (
        <LoaderPaperComponent />
      )}
    </div>
  );
}

export default JointDetails;
