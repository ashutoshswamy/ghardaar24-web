import { sileo } from "sileo";

type Kind = "success" | "error" | "warning" | "info";

const ERROR = /fail|error|could not|unable|missing|not found|not supported|denied/i;
const WARN = /^please|required|already exists|no valid|skipped|only|select at least/i;
const OK = /success|deleted|imported|created|updated|saved|removed|uploaded|copied|sent/i;

const TITLES: Record<Kind, string> = {
  success: "Done",
  error: "Something went wrong",
  warning: "Heads up",
  info: "Note",
};

function kindOf(message: string): Kind {
  if (ERROR.test(message)) return "error";
  if (WARN.test(message)) return "warning";
  if (OK.test(message)) return "success";
  return "info";
}

/** Drop-in replacement for window.alert that shows a sileo toast. */
export function notify(message: string, kind: Kind = kindOf(message)) {
  sileo[kind]({ title: TITLES[kind], description: message });
}

export { sileo };
