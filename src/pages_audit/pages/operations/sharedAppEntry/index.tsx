import React from "react";
import SharedAppEntry from "./SharedAppEntry";
import AcctMSTProvider from "../acct-mst/AcctMSTContext";

const MainSharedAppEntry: any = () => {
  return (
    <>
      <AcctMSTProvider>
        <SharedAppEntry />
      </AcctMSTProvider>
    </>
  );
};

export default MainSharedAppEntry;
