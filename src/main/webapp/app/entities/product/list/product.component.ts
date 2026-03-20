import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProduct } from '../product.model';

import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { ProductService } from '../service/product.service';
import { ProductDeleteDialogComponent } from '../delete/product-delete-dialog.component';
import { DataUtils } from 'app/core/util/data-util.service';
import { SortService } from 'app/shared/sort/sort.service';

@Component({
  selector: 'jhi-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit, OnDestroy {
  products?: IProduct[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  currentSearch = ''; // To handle search functionality

  private routeDataSubscription?: Subscription;

  constructor(
    protected productService: ProductService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected sortService: SortService,
    protected modalService: NgbModal,
    protected dataUtils: DataUtils // JHipster utility for handling data (e.g., base64 blob content)
  ) {}

  ngOnInit(): void {
    this.handleNavigation();
  }

  protected handleNavigation(): void {
    this.routeDataSubscription = combineLatest([
      this.activatedRoute.data,
      this.activatedRoute.queryParamMap,
    ]).subscribe(([data, params]) => {
      const page = params.get('page');
      this.page = page !== null ? +page : 1;
      const sort = (params.get('sort') ?? data['defaultSort']).split(',');
      this.predicate = sort[0];
      this.ascending = sort[1] === 'asc';
      this.currentSearch = params.get('search') ?? ''; // Capture search query from route
      this.loadPage(this.page);
    });
  }

  loadPage(page?: number): void {
    this.isLoading = true;
    const pageToLoad: number = page ?? this.page;

    this.productService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sortService.sortInfo(this.predicate, this.ascending),
        ...(this.currentSearch ? { 'name.contains': this.currentSearch } : {}), // Example for search by product name
      })
      .subscribe({
        next: (res: HttpResponse<IProduct[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers, pageToLoad);
        },
        error: () => {
          this.isLoading = false;
          this.onError();
        },
      });
  }

  search(query: string): void {
    this.currentSearch = query;
    this.navigateToWithComponentValues(); // Update route params and trigger reload
  }

  protected onSuccess(data: IProduct[] | null, headers: HttpHeaders, page: number): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.products = data ?? [];
    this.ngbPaginationPage = page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1; // Fallback to current page or 1 on error
  }

  trackId(index: number, item: IProduct): number {
    return item.id!;
  }

  delete(product: IProduct): void {
    const modalRef = this.modalService.open(ProductDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.product = product;
    // Reload the page after the modal is closed, assuming a successful deletion.
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadPage();
      }
    });
  }

  sort(): void {
    this.navigateToWithComponentValues();
  }

  protected navigateToWithComponentValues(): void {
    this.router.navigate(['/product'], {
      queryParams: {
        page: this.page,
        size: this.itemsPerPage,
        sort: this.sortService.sortInfo(this.predicate, this.ascending).join(','),
        ...(this.currentSearch ? { search: this.currentSearch } : {}),
      },
    });
  }

  ngOnDestroy(): void {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
  }
}