import {Actions, Effect, ofType} from '@ngrx/effects';
import * as RecipesActions from './recipe.actions';
import {map, switchMap} from 'rxjs/operators';
import {Recipe} from '../recipe.model';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable()
export class RecipeEffects {
  constructor(private actions$: Actions, private httpClient: HttpClient) {
  }

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipesActions.FETCH_RECIPES),
    switchMap(() =>
      this.httpClient
        .get<Recipe[]>(environment.firebaseRecipesUrl)
    ),
    map((recipes) => {
      return recipes.map((recipe) => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : [],
        };
      });
    }),
    map(recipes => new RecipesActions.SetRecipes(recipes))
  );
}
