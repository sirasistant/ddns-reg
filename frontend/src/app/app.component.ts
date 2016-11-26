import { Component, AfterViewInit, ViewContainerRef, PipeTransform, Pipe } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router, NavigationEnd } from "@angular/router";

@Component({
  selector: 'app',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {

  inLogin = false;

  constructor(private router: Router, private viewContainerRef: ViewContainerRef) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scroll(0, 0);
      }
    })
  }

}
