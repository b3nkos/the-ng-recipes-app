import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {of} from "rxjs";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export class AuthEffects {
  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=
      ${environment.firebaseAPIKey}`;

      return this.httpClient.post<AuthResponseData>(url, {
        email: authData.payload.email,
        password: authData.payload.password,
        returnSecureToken: true
      }).pipe(
        catchError(error => {
          of();
        }),
        map(responseData => {
          of();
        })
      );
    })
  );

  constructor(private actions$: Actions, private httpClient: HttpClient) {
  }
}
