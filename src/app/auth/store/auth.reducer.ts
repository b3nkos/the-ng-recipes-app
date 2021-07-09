import {Action} from '@ngrx/store';
import {UserModel} from '../user.model';

export interface State {
  user: UserModel;
}

const initialState: State = {
  user: null
};

export function authReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    default:
      return {...state};
  }
}
