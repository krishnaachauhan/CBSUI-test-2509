import { formatDistanceToNow } from "date-fns";
export const validateDate = (value) => {
  try {
    if (isNaN(value)) {
      return formatDistanceToNow(new Date(value), { addSuffix: true });
    }
  } catch (e) {
    return "Invalid Date";
  }
};
