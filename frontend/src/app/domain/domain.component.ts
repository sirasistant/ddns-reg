import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { URLSearchParams } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Domain, SubDomain } from "../model/domain";
import { ModalDirective } from 'ng2-bootstrap';
import { NgForm } from '@angular/forms';
import { ContractService } from "../services/contract.service";
declare var blockies: any;
declare var Trianglify: any;

@Component({
    selector: 'domainpage',
    templateUrl: 'app/domain/domain.html'
})
export class DomainComponent implements OnInit {
    @ViewChild('createSubdomainModal') createSubdomainModal: ModalDirective;
    @ViewChild('registerSubdomainForm') registerSubdomainForm: NgForm;
    iconData: String;
    backgroundData: String;
    domain: Domain;

    subdomainName: String;
    subdomainType: String;
    subdomainValue: String;

    constructor(private contractService: ContractService, private router: Router, private route: ActivatedRoute) {

    }

    ngOnInit() {
        if(!this.contractService.web3){
            this.router.navigate([""]);
        }else{
            this.route.params.forEach(params => {
                var id = params["domainId"];
                var domain = this.contractService.domains.filter(domain => domain.name === id)[0];
                if (domain) {
                    this.domain = domain;
                }
                this.generateIcon();

                this.contractService.domainCountSubject.subscribe((count) => {
                    var domain = this.contractService.domains.filter(domain => domain.name === id)[0];
                    if (domain) {
                        this.domain = domain;
                    }
                    this.generateIcon();
                })

            });
        }
    }

    openSubdomain(subdomain: SubDomain) {
        this.subdomainName = subdomain.name;
        this.subdomainType = subdomain.type + "";
        this.subdomainValue = subdomain.value;
        this.createSubdomainModal.show();
    }

    openRegisterSubdomainModal() {
        this.subdomainName = "";
        this.subdomainType = "1";
        this.subdomainValue = "";
        this.createSubdomainModal.show();
    }

    isIPV4(value:string){
        return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(value);
    }

    registerSubdomain() {
        if (this.registerSubdomainForm.form.valid) {
            if(this.subdomainType===(""+2)&&!this.isIPV4(this.subdomainValue.toString())){
                alert("Not a valid IP address");
            }else{
                this.contractService.registerSubdomain(this.domain.name,this.subdomainName,parseInt(this.subdomainType.toString()),this.subdomainValue).then((nothing)=>{
                    this.createSubdomainModal.hide();
                }).catch(err=>{
                       alert(err.message.split('\n')[0]);
                })
            }
        }
    }

    generateIcon() {
        this.iconData = blockies.create({
            seed: this.domain ? this.domain.txHash : "0x",
            scale: 30
        }).toDataURL();
        var pattern = Trianglify({ seed: this.domain ? this.domain.txHash : "0x" });
        this.backgroundData = pattern.png();
    }

    back() {
        this.router.navigate([""]);
    }

    readableType(type: Number): String {
        switch (type) {
            case 1:
                return "CNAME";
            case 2:
                return "IPV4"
            case 3:
                return "IPV6"
            default:
                return "";
        }
    }

}
