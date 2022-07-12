import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ScrollingModule } from '@angular/cdk/scrolling';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { ProductItemComponent } from './product-item/product-item.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScrollingModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage, ProductItemComponent]
})
export class HomePageModule {}
