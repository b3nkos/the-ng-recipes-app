import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, Subject, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {UserModel} from './user.model';

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

  userSubject = new Subject<UserModel>();

  constructor(private httpClient: HttpClient) {
  }

  public signUp(email: string, password: string): Observable<AuthResponseData> {
    return this.httpClient.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyD_fw8EUo0AS8PAXEQiRYTxUwpCNDeAMfc', {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      catchError(this.handleError),
      tap(this.handlerUserAuthentication)
    );
  }

  public login(email: string, password: string): Observable<AuthResponseData> {
    return this.httpClient.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD_fw8EUo0AS8PAXEQiRYTxUwpCNDeAMfc', {
      email,
      password,
      returnSecureToken: true
    }).pipe(
      catchError(this.handleError),
      tap(this.handlerUserAuthentication)
    );
  }

  private handlerUserAuthentication = (responseData: AuthResponseData) => {
    const timestamp: number = new Date().getTime() + +responseData.expiresIn * 1000;
    const expirationDate = new Date(timestamp);
    const user = new UserModel(responseData.localId,
      responseData.email, responseData.idToken, expirationDate);
    this.userSubject.next(user);
  }

  private handleError(errorResponse: HttpErrorResponse): Observable<never> {
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
    }

    return throwError(errorMessage);
  }
}
