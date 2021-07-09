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
  // private recipes: Recipe[] = [
  //   new Recipe(
  //     'A Tes Recipe',
  //     'This is a simply test',
  //     'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_960_720.jpg',
  //     [
  //       new Ingredient('Meat', 1),
  //       new Ingredient('French Fries', 20)
  //     ]
  //   ),
  //   new Recipe(
  //     'A Tes Recipe Two',
  //     'This is a simply test for two recipe',
  //     'https://media.istockphoto.com/photos/steakhouse-menu-smoked-meat-assortment-vegetables-picture-id1171009981',
  //     [
  //       new Ingredient('Buns', 2),
  //       new Ingredient('Meat', 2)
  //     ]
  //   )
  // ];

  private recipes: Recipe[] = [];

  constructor(private store: Store<fromApp.AppState>) {
  }

  public setRecipes(recipesList: Recipe[]): void {
    this.recipes = recipesList;
    this.recipesChanged.next(this.recipes.slice());
  }

  getRecipes(): Recipe[] {
    return this.recipes.slice();
  }

  getRecipeByIndex(index: number): Recipe {
    return this.recipes.slice()[index];
  }

  addIngredientsToShoppingList(ingredients: Ingredient[]): void {
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
