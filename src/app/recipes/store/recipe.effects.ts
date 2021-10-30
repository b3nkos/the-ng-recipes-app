import { Actions, Effect, ofType } from '@ngrx/effects';
import * as RecipesActions from './recipe.actions';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {
  constructor(
    private actions$: Actions,
    private httpClient: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() =>
      this.httpClient.get<Recipe[]>(environment.firebaseRecipesUrl)
    ),
    map((recipes) => {
      return recipes.map((recipe) => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : [],
        };
      });
    }),
    map((recipes: Recipe[]) => new RecipesActions.SetRecipes(recipes))
  );

  @Effect({ dispatch: false })
  storeRecipes = this.actions$.pipe(
    ofType(RecipesActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([_, recipesState]) => {
      return this.httpClient.put(
        'https://ng-course-recipe-book-2124b-default-rtdb.firebaseio.com/recipes.json',
        recipesState.recipes
      );
    })
  );
}
