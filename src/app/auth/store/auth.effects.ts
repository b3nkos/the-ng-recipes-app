import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {UserModel} from '../user.model';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable()
export class AuthEffects {

  constructor(private actions$: Actions, private httpClient: HttpClient, private router: Router) {
  }

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
        map((responseData: AuthResponseData) => {
          const timestamp: number = new Date().getTime() + +responseData.expiresIn * 1000;
          const expirationDate = new Date(timestamp);
          const user = new UserModel(responseData.localId,
            responseData.email, responseData.idToken, expirationDate);
          return new AuthActions.Login(user);
        }),
        catchError(errorResponse => {
          let errorMessage = 'An unknown error occurs';

          if (!errorResponse.error || !errorResponse.error.error) {
            return of(new AuthActions.LoginFail(errorMessage));
          }

          switch (errorResponse.error.error.message) {
            case 'EMAIL_EXISTS':
              errorMessage = 'This email already exist!';
              break;
            case 'INVALID_PASSWORD':
              errorMessage = 'The password is invalid or the user does not have a password.';
              break;
            case 'EMAIL_NOT_FOUND':
              errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
              break;
            case 'USER_DISABLED':
              errorMessage = 'The user account has been disabled by an administrator.';
              break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
              errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts';
              break;
          }

          return of(new AuthActions.LoginFail(errorMessage));
        })
      );
    })
  );

  @Effect({dispatch: false})
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.LOGIN),
    tap(() => {
      this.router.navigate(['/']);
    })
  );
}
