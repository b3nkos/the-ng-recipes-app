import {Action} from '@ngrx/store';
import {UserModel} from '../user.model';

export const LOGIN_START = 'LOGIN_START';
export const AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS';
export const SIGNUP_START = 'SIGNUP_START';
export const AUTHENTICATE_FAIL = 'AUTHENTICATE_FAIL';
export const LOGOUT = 'LOGOUT';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export class AuthenticateSuccess implements Action {
  readonly type = AUTHENTICATE_SUCCESS;

  constructor(public payload: UserModel) {
  }
}

export class Logout implements Action {
  readonly type = LOGOUT;
}

export class LoginStart implements Action {
  readonly type = LOGIN_START;

  constructor(public payload: { email: string, password: string }) {
  }
}

export class SignupStart implements Action {
  readonly type = SIGNUP_START;

  constructor(public payload: { email: string, password: string }) {
  }
}

export class AuthenticateFail implements Action {
  readonly type = AUTHENTICATE_FAIL;

  constructor(public payload: string) {
  }
}

export class ClearError implements Action {
  readonly type = CLEAR_ERROR;
}

export type AuthActions = AuthenticateSuccess | Logout | LoginStart | AuthenticateFail | SignupStart | ClearError;
