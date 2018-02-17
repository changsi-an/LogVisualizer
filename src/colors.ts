import * as tinycolor from 'tinycolor2';

export const FromTargetColor = tinycolor('#107c10');
export const ToTargetColor = FromTargetColor.clone().brighten(20);
export const FromClientColor = tinycolor('DarkTurquoise');
export const ToClientColor = FromClientColor.clone().darken(20);
