import { Component, OnInit } from '@angular/core';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { map, switchMap } from 'rxjs/operators';
import * as RecipesActions from '../store/recipe.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params: Params) => +params.id),
        switchMap((id) => {
          this.id = id;
          return this.store.select('recipes');
        }),
        map((recipeState) =>
          recipeState.recipes.find((recipe, index) => index === this.id)
        )
      )
      .subscribe((recipe: Recipe) => (this.recipe = recipe));
  }

  onAddToShoppingList(): void {
    this.recipeService.addIngredientsToShoppingList(this.recipe.ingredients);
  }

  onEditRecipe(): void {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  public onDeleteRecipe(): void {
    this.store.dispatch(new RecipesActions.DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }
}
