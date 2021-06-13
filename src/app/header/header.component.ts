import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataStorageService} from '../shared/data-storage.service';
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  private userSubject: Subscription;

  constructor(private dataStorageService: DataStorageService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userSubject = this.authService.userSubject.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy(): void {
    this.userSubject.unsubscribe();
  }

  public onSaveData(): void {
    this.dataStorageService.storeRecipes();
  }

  public onFetchData(): void {
    this.dataStorageService.fetchRecipes().subscribe(recipes => {

    });
  }

}
