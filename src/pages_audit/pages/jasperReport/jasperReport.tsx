import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const CommonReportWrapper = lazy(() => import("./commonReport/commonrReport"));

export const JasperReports = () => (
  <Routes>
    <Route path="*" element={<CommonReportWrapper />} />
  </Routes>
);
