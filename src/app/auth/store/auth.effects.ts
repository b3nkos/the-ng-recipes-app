import {Actions, Effect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {UserModel} from '../user.model';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const USER_DATA_LOCAL_STORAGE_KEY = 'userData';

const handleAuthentication = (responseData: AuthResponseData): AuthActions.AuthenticateSuccess => {
  const timestamp: number = new Date().getTime() + +responseData.expiresIn * 1000;
  const expirationDate = new Date(timestamp);
  const user = new UserModel(responseData.localId,
    responseData.email, responseData.idToken, expirationDate);
  localStorage.setItem(USER_DATA_LOCAL_STORAGE_KEY, JSON.stringify(user));
  return new AuthActions.AuthenticateSuccess({user, redirect: true});
};

const handleError = (errorResponse): Observable<AuthActions.AuthenticateFail> => {
  let errorMessage = 'An unknown error occurs';

  if (!errorResponse.error || !errorResponse.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
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

  return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {

  constructor(private actions$: Actions, private httpClient: HttpClient, private router: Router, private authService: AuthService) {
  }

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {

      return this.httpClient
        .post<AuthResponseData>(`${environment.firebaseIdentityBaseUrl}signInWithPassword?key=${environment.firebaseAPIKey}`, {
          email: authData.payload.email,
          password: authData.payload.password,
          returnSecureToken: true
        }).pipe(
          tap((responseData: AuthResponseData) => {
            this.authService.setLogoutTimer(+responseData.expiresIn * 1000);
          }),
          map((responseData: AuthResponseData) => {
            return handleAuthentication(responseData);
          }),
          catchError(errorResponse => {
            return handleError(errorResponse);
          })
        );
    })
  );

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.httpClient
        .post<AuthResponseData>(`${environment.firebaseIdentityBaseUrl}signUp?key=${environment.firebaseAPIKey}`, {
          email: signupAction.payload.email,
          password: signupAction.payload.password,
          returnSecureToken: true
        }).pipe(
          tap((responseData: AuthResponseData) => {
            this.authService.setLogoutTimer(+responseData.expiresIn * 1000);
          }),
          map((responseData: AuthResponseData) => {
            return handleAuthentication(responseData);
          }),
          catchError(errorResponse => {
            return handleError(errorResponse);
          })
        );
    })
  );

  @Effect({dispatch: false})
  authRedirect = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if (authSuccessAction.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        id: string;
        email: string;
        userToken: string;
        tokenExpirationDate: Date
      } = JSON.parse(localStorage.getItem(USER_DATA_LOCAL_STORAGE_KEY));

      if (!userData) {
        return {type: 'DUMMY'};
      }

      const loadedUser = new UserModel(userData.id,
        userData.email, userData.userToken, new Date(userData.tokenExpirationDate));

      if (loadedUser.token) {
        const expirationDuration: number = loadedUser.tokenExpirationDate.getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration);
        return new AuthActions.AuthenticateSuccess({user: loadedUser, redirect: false});
      }

      return {type: 'DUMMY'};
    })
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.authService.clearLogoutTimer();
      localStorage.removeItem(USER_DATA_LOCAL_STORAGE_KEY);
      this.router.navigate(['/auth']);
    })
  );
}
