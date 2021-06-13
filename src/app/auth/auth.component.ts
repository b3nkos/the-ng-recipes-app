import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  error: string = null;

  constructor(private authService: AuthService, private router: Router) {
  }

  public onSwitchMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  public onSubmit(authForm: NgForm): void {
    if (authForm.invalid) {
      return;
    }

    const email: string = authForm.value.email;
    const password: string = authForm.value.password;

    this.isLoading = true;

    const authObservable: Observable<AuthResponseData> = this.isLoginMode ?
      this.authService.login(email, password) :
      this.authService.signUp(email, password);

    const handleSuccessLogin = (responseData) => {
      console.log(responseData);
      this.isLoading = false;
      this.router.navigate(['/recipes']);
    };

    const handleErrorLogin = (errorMessage) => {
      this.error = errorMessage;
      console.error(errorMessage);
      this.isLoading = false;
    };

    authObservable.subscribe(handleSuccessLogin, handleErrorLogin);

    authForm.reset();
  }
}