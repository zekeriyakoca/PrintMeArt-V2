import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  category: string = '';
  // products: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    // this.route.paramMap.subscribe(params => {
    //   this.category = params.get('category') || '';
    //   this.fetchProducts();
    // });
  }

  // fetchProducts() {
  //   // Replace with actual API call
  //   this.http.get<any[]>(`https://api.example.com/products?category=${this.category}`)
  //     .subscribe(data => {
  //       this.products = data;
  //     });
  // }

  products = [
    'The Little Street',
    'Autumn River',
    'Still Life with Roses',
    'Winter Day',
    'The Starry Night',
  ];
}
