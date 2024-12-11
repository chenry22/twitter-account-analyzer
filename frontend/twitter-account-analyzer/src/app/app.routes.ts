import { Routes } from '@angular/router';
import { AccountDataComponent } from './account-data/account-data.component';
import { AccountSearchComponent } from './account-search/account-search.component';

export const routes: Routes = [
    {path : '', component : AccountSearchComponent },
    {path : 'account/:username', component : AccountDataComponent}
];