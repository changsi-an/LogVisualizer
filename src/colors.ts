import * as tinycolor from 'tinycolor2';

export const FromTargetColor = tinycolor('rgb(219, 112, 147)');
export const ToTargetColor = FromTargetColor.clone().lighten(20);
export const FromClientColor = tinycolor('DarkTurquoise');
export const ToClientColor = FromClientColor.clone().darken(20);
