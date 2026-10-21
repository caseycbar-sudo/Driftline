/**
 * The QR-code start page: pure rules for the guided questions, kept free of framework imports
 * so they can be unit tested. The price math lives in request-core (startPick).
 */

/** Household sizes offered as big buttons. Anything larger goes to a phone call. */
export const HOUSEHOLD_SIZES = [1, 2, 3, 4, 5] as const;

/** Where the new account lands after the code is entered: the dish picker, already set to their household. */
export function afterSignupPath(people: number): string {
  const n = Number.isInteger(people) && people >= 1 && people <= 8 ? people : 2;
  return `/account/plan?people=${n}`;
}
