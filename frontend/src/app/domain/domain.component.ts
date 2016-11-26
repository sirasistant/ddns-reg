import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { URLSearchParams } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { ContractService } from "../services/contract.service";

@Component({
    selector: 'domainpage',
    templateUrl: 'app/domain/domain.html'
})
export class DomainComponent implements OnInit {

    constructor(private contractService: ContractService) { }

    ngOnInit() {

    }

}
