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

  onSubmit(form: NgForm): void {
    const formValue = form.value;
    const newIngredient = new Ingredient(formValue.name, formValue.amount);
    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.editingItemIngredientIndex, newIngredient);
    } else {
      this.shoppingListService.addIngredient(newIngredient);
    }
    this.editMode = false;
    form.reset();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onClear(): void {
    this.shoppingEditForm.reset();
    this.editMode = false;
  }

  onDelete(): void {
    this.shoppingListService.deleteIngredient(this.editingItemIngredientIndex);
    this.onClear();
  }
}
