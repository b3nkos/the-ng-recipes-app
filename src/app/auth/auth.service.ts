import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {UserModel} from './user.model';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {Store} from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenExpirationTimer: any;

  constructor(private httpClient: HttpClient, private router: Router, private store: Store<fromApp.AppState>) {
  }

  private static getTimestamp(expiresIn: number): number {
    return new Date().getTime() + expiresIn * 1000;
  }

  private static handleError(errorResponse: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurs';

    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(errorMessage);
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

    return throwError(errorMessage);
  }

  public signUp(email: string, password: string): Observable<AuthResponseData> {
    return this.httpClient.post<AuthResponseData>(`${environment.firebaseBaseUrl}signUp?key=${environment.firebaseAPIKey}`, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      catchError(AuthService.handleError),
      tap(this.handlerUserAuthentication)
    );
  }

  public login(email: string, password: string): Observable<AuthResponseData> {
    return this.httpClient.post<AuthResponseData>(`${environment.firebaseBaseUrl}signInWithPassword?key=${environment.firebaseAPIKey}`, {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      catchError(AuthService.handleError),
      tap(this.handlerUserAuthentication)
    );
  }

  public logout(): void {
    this.store.dispatch(new AuthActions.Logout());
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = null;
  }

  public autoLogin(): void {
    const userData: {
      id: string;
      email: string;
      _token: string;
      _tokenExpirationDate: string
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    const expirationDate = new Date(userData._tokenExpirationDate);
    const loadedUser = new UserModel(userData.id,
      userData.email, userData._token, expirationDate);

    if (loadedUser.token) {
      this.store.dispatch(new AuthActions.AuthenticateSuccess(loadedUser));
      const expirationDuration: number = expirationDate.getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  public autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handlerUserAuthentication = (responseData: AuthResponseData) => {
    const timestamp = AuthService.getTimestamp(+responseData.expiresIn);
    const expirationDate = new Date(timestamp);
    const user = new UserModel(responseData.localId,
      responseData.email, responseData.idToken, expirationDate);
    this.store.dispatch(new AuthActions.AuthenticateSuccess(user));
    this.autoLogout(+responseData.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }
}
