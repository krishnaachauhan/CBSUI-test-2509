import AcctModal from "../acct-mst/AcctModal";
import { Alert } from "@acuteinfo/common-base";
import EnfinityLoader from "components/common/loader/EnfinityLoader";
import useShareAppEntry from "./Hooks/useShareAppEntry";

const SharedAppEntry = () => {
  const {
    location,
    isError,
    error,
    retrieveJointTabData,
    isCallFinalSaveRef,
    tabMappings,
    validateShareScreenApp,
    screenHeader,
    result,
  } = useShareAppEntry();

  return location.state ? (
    <>
      {isError && (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Something went wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <EnfinityLoader
        loading={retrieveJointTabData?.isLoading || result?.isLoading}
      />
      <AcctModal
        asDialog={false}
        isCallFinalSaveRef={isCallFinalSaveRef}
        isHeaderDisplay={false}
        tabMappings={tabMappings}
        validateShareScreenApp={validateShareScreenApp}
        screenFlag="ShareApp"
        title={screenHeader}
      />
    </>
  ) : null;
};

export default SharedAppEntry;
