import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ActionTypes,
  GridWrapper,
  GridMetaDataType,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { LoaderPaperComponent } from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
];

export const ViewEodReport = ({
  open,
  close,
  metaData,
  reportData,
  reportLabel,
  loading,
}) => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [uniqueReportData, setUniqueReportData] = useState([]);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "close") {
        close();
      }
      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate, close]
  );

  useEffect(() => {
    if (Array.isArray(reportData)) {
      const updatedReportData: any = reportData.map((item, index) => ({
        ...item,
        INDEX: `${index}`, // Unique key can be any string, here we're using index
      }));
      setUniqueReportData(updatedReportData);
    }
  }, [reportData]);

  metaData.gridConfig.gridLabel = reportLabel;

  return (
    <>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            width: "70%",
            overflow: "auto",
          },
        }}
        maxWidth="lg"
      >
        {loading ? (
          <LoaderPaperComponent />
        ) : (
          <GridWrapper
            key={"ViewEodReport"}
            finalMetaData={metaData as GridMetaDataType}
            setData={() => null}
            actions={actions}
            enableExport={true}
            data={uniqueReportData ?? []}
            loading={loading}
            setAction={setCurrentAction}
          />
        )}
      </Dialog>
    </>
  );
};
