import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { URLSearchParams } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { ModalDirective } from 'ng2-bootstrap';
import { NgForm } from '@angular/forms';
import { Domain } from '../model/domain';
import { ContractService } from "../services/contract.service";

@Component({
    selector: 'homepage',
    templateUrl: 'app/home/home.html'
})
export class HomeComponent implements OnInit {
    @ViewChild('registerDomainModal') registerDomainModal: ModalDirective;
    @ViewChild('registerDomainForm') registerDomainForm: NgForm;

    domains: any[] = [];
    web3:any;

    newDomainName: String;

    constructor(private contractService: ContractService, private router: Router) {
        this.domains = this.contractService.domains;
    }

    ngOnInit() {
        this.web3 = this.contractService.web3;
    }

    openRegisterModal() {
        this.registerDomainModal.show();
    }

    openDomain(domain:Domain){
        this.router.navigate(["/domains", domain.name]);
    }

    registerDomain() {
        if (this.registerDomainForm.form.valid) {
            var unsafeName = this.newDomainName.toLowerCase();
            if ((unsafeName.match(/[.]/g) || []).length != 1 || !(/^[\x00-\x7F]*$/.test(unsafeName))) {
                alert("The domain name is not valid");
            } else {
                this.contractService.registerDomain(unsafeName).then(nothing => {
                    this.newDomainName = "";
                    this.registerDomainModal.hide();
                }).catch(err => {
                    alert(err.message.split('\n')[0]);
                })
            }
        }
    }

}
