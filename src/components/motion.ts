/** The only easing in the app. Motion happens in response to a click or key, never on its own. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const T = { duration: 0.3, ease: EASE };
export const T_SLOW = { duration: 0.6, ease: EASE };
