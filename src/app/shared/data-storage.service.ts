import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeService } from '../recipes/recipe.service';
import { Observable, Subscription } from 'rxjs';
import { Recipe } from '../recipes/recipe.model';
import { map, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipe.actions';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  constructor(
    private httpClient: HttpClient,
    private recipeService: RecipeService,
    private store: Store<fromApp.AppState>
  ) {}

  public storeRecipes(): Subscription {
    const recipeList = this.recipeService.getRecipes();
    return this.httpClient
      .put(
        'https://ng-course-recipe-book-2124b-default-rtdb.firebaseio.com/recipes.json',
        recipeList
      )
      .subscribe((response) => {
        console.log(response);
      });
  }

  public fetchRecipes(): Observable<Recipe[]> {
    return this.httpClient
      .get<Recipe[]>(
        'https://ng-course-recipe-book-2124b-default-rtdb.firebaseio.com/recipes.json'
      )
      .pipe(
        map((recipes) => {
          return recipes.map((recipe) => {
            return {
              ...recipe,
              ingredients: recipe.ingredients ? recipe.ingredients : [],
            };
          });
        }),
        tap((recipes: Recipe[]) => {
          this.store.dispatch(new RecipesActions.SetRecipes(recipes));
        })
      );
  }
}
