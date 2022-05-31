import { Component, Input } from '@angular/core';
import { Inventory } from 'src/store/inventory';
import { differenceInDays } from 'date-fns';

@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss'],
})
export class ProductItemComponent {
  @Input() product!: Inventory;

  constructor() {
  }

  get isNew(): boolean {
    return differenceInDays(new Date(), new Date(this.product.fields.Posted)) <= 7;
  }

  get imgSrc(): string {
    return this.product.fields['Product Image'] || null;
  }

  get title(): string {
    return this.product.fields['Product Name'] ? this.product.fields['Product Name'] :  this.product.fields['Product Code'] ;
  }

  get categories(): string[] {
    return this.product.fields['Product Categories'] ? this.product.fields['Product Categories'].split(',') : [];
  }
}
