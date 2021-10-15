import {Recipe} from './recipe.model';
import {Injectable} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {Subject} from 'rxjs';
import {Store} from '@ngrx/store';
import * as ShoppingListActions from '../shopping-list/store/shopping-list.actions';
import * as fromApp from '../store/app.reducer';

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [];

  constructor(private store: Store<fromApp.AppState>) {
  }

  public setRecipes(recipesList: Recipe[]): void {
    this.recipes = recipesList;
    this.recipesChanged.next(this.recipes.slice());
  }

  public getRecipes(): Recipe[] {
    return this.recipes.slice();
  }

  public getRecipeByIndex(index: number): Recipe {
    return this.recipes.slice()[index];
  }

  public addIngredientsToShoppingList(ingredients: Ingredient[]): void {
    this.store.dispatch(new ShoppingListActions.AddIngredients(ingredients));
  }

  public addRecipe(recipe: Recipe): void {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  public updateRecipe(index: number, newRecipe: Recipe): void {
    this.recipes[+index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  public deleteRecipe(index: number): void {
    this.recipes.splice(+index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }
}
