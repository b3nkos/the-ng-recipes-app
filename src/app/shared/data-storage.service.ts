import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RecipeService} from '../recipes/recipe.service';
import {Subscription} from 'rxjs';
import {Recipe} from '../recipes/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {
  constructor(private httpClient: HttpClient, private recipeService: RecipeService) {
  }

  public storeRecipes(): Subscription {
    const recipeList = this.recipeService.getRecipes();
    return this.httpClient.put('https://ng-course-recipe-book-2124b-default-rtdb.firebaseio.com/recipes.json',
      recipeList)
      .subscribe(response => {
        console.log(response);
      });
  }

  public fetchRecipes(): Subscription {
    return this.httpClient.get<Recipe[]>('https://ng-course-recipe-book-2124b-default-rtdb.firebaseio.com/recipes.json')
      .subscribe(recipes => {
        this.recipeService.setRecipes(recipes);
      });
  }
}
