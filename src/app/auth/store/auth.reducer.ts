import {UserModel} from '../user.model';
import * as AuthActions from './auth.actions';

export interface State {
  user: UserModel;
}

const initialState: State = {
  user: null
};

export function authReducer(state: State = initialState, action: AuthActions.AuthActions): State {
  switch (action.type) {
    case AuthActions.LOGIN:
      const user = new UserModel(action.payload.id, action.payload.email,
        action.payload.token, action.payload.tokenExpirationDate);
      return {
        ...state,
        user
      };
    case AuthActions.LOGOUT:
      return {
        ...state,
        user: null
      };
    default:
      return {...state};
  }
}
