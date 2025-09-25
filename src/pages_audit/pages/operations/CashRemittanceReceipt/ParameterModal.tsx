import { Button, Dialog } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { FormWrapper, MetaDataType } from "@acuteinfo/common-base";
import { forwardRef } from "react";
import { codeMetaData } from "./parameterMetaData";

// ✅ Define Props Type
interface ParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useDialogStyles = makeStyles({
  topScrollPaper: {
    alignItems: "center",
  },
  topPaperScrollBody: {
    verticalAlign: "top",
  },
  title: {
    flex: "1 1 100%",
    color: "var(--white)",
    letterSpacing: "1px",
    fontSize: "1.5rem",
  },
});

// ✅ Use props in forwardRef and cast properly
const ParameterModal = forwardRef<HTMLDivElement, ParameterModalProps>(
  ({ onClose, isOpen }, ref: any) => {
    return (
      <Dialog fullWidth maxWidth="xs" open={isOpen} key="actionsFormDialog">
        <FormWrapper
          key="actionsForm"
          metaData={codeMetaData as MetaDataType}
          onSubmitHandler={(data) => {
            ref.current = data;
            onClose();
          }}
          formStyle={{ background: "white" }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                color="primary"
              >
                Ok
              </Button>

              <Button onClick={onClose} color="primary">
                Close
              </Button>
            </>
          )}
        </FormWrapper>
      </Dialog>
    );
  }
);

export { ParameterModal };
