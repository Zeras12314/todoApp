import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { selectAuthMode, selectLoading, selectUser } from "./auth/auth.selector";

@Injectable({
    providedIn: 'root'
})

export class StoreService{
    store = inject(Store)
    loading$ = this.store.select(selectLoading);
    mode$ = this.store.select(selectAuthMode);
    user$ = this.store.select(selectUser);
}