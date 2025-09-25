import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const ImportLCWrapper = lazy(
  () => import("./Import/LetterOfCredit/entry/tradepara")
);

export const ETFOperationsMenu = () => {
  return (
    <Routes>
      <Route path="import-lc-entry/*" element={<ImportLCWrapper />} />
    </Routes>
  );
};
