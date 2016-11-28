import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { provideInterceptorService, Interceptor, InterceptedRequest, InterceptedResponse } from 'ng2-interceptors';
import { HttpModule } from '@angular/http';
import {DomSanitizer} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { ModalModule, ModalDirective } from 'ng2-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DomainComponent } from './domain/domain.component';

import { ContractService } from './services/contract.service';
import { MaterialModule } from '@angular/material';
@NgModule({
  declarations: [AppComponent,HomeComponent,DomainComponent],
  imports: [FormsModule, ModalModule,HttpModule, BrowserModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'domains/:domainId', component: DomainComponent }
    ]),MaterialModule.forRoot()
  ],
  providers: [ContractService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideInterceptorService([
      // Add interceptors here, like "new ServerURLInterceptor()" or just "ServerURLInterceptor" if it has a provider
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
