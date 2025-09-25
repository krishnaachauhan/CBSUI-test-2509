import AutoCompleteCellEditor from "./AutoCompleteCell";
import CustomButtonCellEditor from "./CustomButtonCell";
import CustomCurrencyEditor from "./CustomCurrencyEditor";
import DatePickerCell from "./DatePickerCell";
import DisplayCell from "./DisplayCell";
import DisplayCurrencyCell from "./DisplayCurrencyCell";
import DisplayDateCell from "./DisplayDateCell";
import DisplaySelectCell from "./DisplaySelectCell";
import NumberFormat from "./NumberFormat";

const commonComponents = {
  // editor
  autocomplete: AutoCompleteCellEditor,
  CustomButtonCellEditor,
  amountField: CustomCurrencyEditor,
  NumberFormat,
  DatePickerCell,
  // renderer
  DisplayCurrencyCell,
  DisplayDateCell,
  DisplaySelectCell,
  DisplayCell,
};

export { commonComponents };
