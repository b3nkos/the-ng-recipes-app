import {Component, ComponentFactoryResolver, OnDestroy, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthResponseData, AuthService} from './auth.service';
import {Observable, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {AlertComponent} from '../shared/alert/alert.component';
import {PlaceholderDirective} from '../shared/placeholder/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective, {static: false}) alertHost: PlaceholderDirective;
  private closeSubscription: Subscription;

  constructor(private authService: AuthService, private router: Router,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnDestroy(): void {
    if (this.closeSubscription) {
      this.closeSubscription.unsubscribe();
    }
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
      this.showErrorAlert(errorMessage);
      console.error(errorMessage);
      this.isLoading = false;
    };

    authObservable.subscribe(handleSuccessLogin, handleErrorLogin);

    authForm.reset();
  }

  public onHandleError(): void {
    this.error = null;
  }

  private showErrorAlert(message: string): void {
    const alertComponentComponentFactory = this.componentFactoryResolver
      .resolveComponentFactory(AlertComponent);

    const hostViewContainerRef = this.alertHost.viewContainerRef;
    hostViewContainerRef.clear();

    const alertComponentComponentRef = hostViewContainerRef.createComponent(alertComponentComponentFactory);
    alertComponentComponentRef.instance.message = message;
    this.closeSubscription = alertComponentComponentRef.instance.close.subscribe(() => {
      this.closeSubscription.unsubscribe();
      hostViewContainerRef.clear();
    });

  }
}
