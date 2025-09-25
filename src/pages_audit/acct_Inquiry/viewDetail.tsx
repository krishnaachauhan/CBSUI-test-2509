import { Button, Dialog } from "@mui/material";
import { ViewDetailMetadata } from "./metaData";
// import { useLocation } from "react-router-dom";
import {
  InitialValuesType,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";

export const ViewDetail = ({ open, onClose, rowsData }) => {
  // const { state: rows }: any = useLocation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "900px",
        },
      }}
    >
      <FormWrapper
        key={`ViewStatement`}
        metaData={ViewDetailMetadata as MetaDataType}
        // initialValues={rows?.[0]?.data as InitialValuesType}
        initialValues={rowsData?.[0]?.data ?? ({} as InitialValuesType)}
        onSubmitHandler={() => {}}
        //   displayMode={formMode}
        formStyle={{
          background: "white",
        }}
        // controlsAtBottom={true}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <Button
              onClick={() => onClose()}
              color={"primary"}
              // disabled={isSubmitting}
            >
              Close
            </Button>
          </>
        )}
      </FormWrapper>
    </Dialog>
  );
};
