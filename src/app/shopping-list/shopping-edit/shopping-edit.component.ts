import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {ShoppingListService} from '../shopping-list.service';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('shoppingEditForm', {static: false}) shoppingEditForm: NgForm;
  subscription: Subscription;
  editMode = false;
  editingItemIngredientIndex: number;
  editingIngredientItem: Ingredient;

  constructor(private shoppingListService: ShoppingListService) {
  }

  ngOnInit(): void {
    this.subscription = this.shoppingListService
      .startedEditing.subscribe((index: number) => {
        this.editMode = true;
        this.editingItemIngredientIndex = index;
        this.editingIngredientItem = this.shoppingListService.getIngredient(index);
        this.shoppingEditForm.setValue({
          name: this.editingIngredientItem.name,
          amount: this.editingIngredientItem.amount
        });
      });
  }

  onAddItem(form: NgForm): void {
    const formValue = form.value;
    const newIngredient = new Ingredient(formValue.name, formValue.amount);
    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.editingItemIngredientIndex, newIngredient);
    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
