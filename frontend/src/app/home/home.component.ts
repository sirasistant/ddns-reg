import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { URLSearchParams } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { ContractService } from "../services/contract.service";

@Component({
    selector: 'homepage',
    templateUrl: 'app/home/home.html'
})
export class HomeComponent implements OnInit {

    constructor(private contractService: ContractService) { }

    ngOnInit() {

    }

}
