import { KIND_ANYTIME, KIND_GOAL } from "./contract";

/** The screens of the new pot flow (Architecture §8.2). Allowing, saving and errors live on the review screen's own buttons. */
export type Screen = "type" | "goal" | "tier" | "amount" | "review" | "success";

export interface NewPotState {
  screen: Screen;
  kind: number;
  name: string;
  targetText: string;
  /** yyyy-mm-dd, as a date input gives it. */
  unlockDate: string;
  tier: number;
  amountText: string;
  /** Set once the pot is open. */
  potId: bigint | null;
}

export type NewPotAction =
  | { type: "chooseKind"; kind: number }
  | { type: "set"; field: "name" | "targetText" | "unlockDate" | "amountText"; value: string }
  | { type: "setTier"; tier: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "saved"; potId: bigint };

export const initialNewPot = (kind?: number): NewPotState => ({
  screen: kind === KIND_GOAL ? "goal" : kind === KIND_ANYTIME ? "tier" : "type",
  kind: kind ?? KIND_ANYTIME,
  name: "",
  targetText: "",
  unlockDate: "",
  tier: 0,
  amountText: "",
  potId: null,
});

const isGoal = (state: NewPotState) => state.kind === KIND_GOAL;

// Going back never clears what was typed.
export function newPotReducer(state: NewPotState, action: NewPotAction): NewPotState {
  switch (action.type) {
    case "chooseKind":
      return { ...state, kind: action.kind, screen: action.kind === KIND_GOAL ? "goal" : "tier" };
    case "set":
      return { ...state, [action.field]: action.value };
    case "setTier":
      return { ...state, tier: action.tier };
    case "next":
      switch (state.screen) {
        case "goal":
          return { ...state, screen: "tier" };
        case "tier":
          return { ...state, screen: "amount" };
        case "amount":
          return { ...state, screen: "review" };
        default:
          return state;
      }
    case "back":
      switch (state.screen) {
        case "goal":
          return { ...state, screen: "type" };
        case "tier":
          return { ...state, screen: isGoal(state) ? "goal" : "type" };
        case "amount":
          return { ...state, screen: "tier" };
        case "review":
          return { ...state, screen: "amount" };
        default:
          return state;
      }
    case "saved":
      return { ...state, potId: action.potId, screen: "success" };
  }
}

/** The step titles shown above the flow, which depend on the kind of pot. */
export function newPotSteps(state: NewPotState): { titles: string[]; current: number } {
  const screens: Screen[] = isGoal(state) ? ["type", "goal", "tier", "amount", "review"] : ["type", "tier", "amount", "review"];
  const titles = isGoal(state) ? ["Type", "Goal", "Portfolio", "Amount", "Review"] : ["Type", "Portfolio", "Amount", "Review"];
  return { titles, current: state.screen === "success" ? titles.length : screens.indexOf(state.screen) };
}

/** A date input's value as the unix second that day starts, in the user's own time zone. */
export function unlockAtFromDate(date: string): bigint | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const time = new Date(year!, month! - 1, day!).getTime();
  return Number.isNaN(time) ? null : BigInt(Math.floor(time / 1000));
}

/** Tomorrow as yyyy-mm-dd: the earliest unlock date a goal can have. */
export function earliestUnlockDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
