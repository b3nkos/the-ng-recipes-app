import {Action} from '@ngrx/store';
import {UserModel} from '../user.model';

export const LOGIN_START = 'LOGIN_START';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export class Login implements Action {
  readonly type = LOGIN;

  constructor(public payload: UserModel) {
  }
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export type AuthActions = Login | Logout;
