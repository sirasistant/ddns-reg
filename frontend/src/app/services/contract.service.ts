import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { Domain, SubDomain } from "../model/domain";
import { Observable, BehaviorSubject } from "rxjs";
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
declare var web3: any;

@Injectable()
export class ContractService {
    CONTRACT_ADDRESS = "0x653D5F476b457d0C83901e202499B07A84ae522c";
    domainCountSubject = new BehaviorSubject<Number>(0);
    domains: Domain[] = [];
    contract: any;

    constructor(private _http: Http, private zone: NgZone) {
        if (web3) {
            web3.eth.getAccounts((err: any, list: string[]) => {
                this._http.get("assets/contract.json").map((res) => {
                    return res.json();
                }).toPromise().then((abi: any) => {

                    this.contract = web3.eth.contract(abi).at(this.CONTRACT_ADDRESS);

                    var domainRegistered = this.contract.domainRegistered({ owner: list }, { fromBlock: 0, toBlock: 'latest' });
                    var subDomainRegistered = this.contract.subDomainRegistered({ owner: list }, { fromBlock: 0, toBlock: 'latest' });

                    domainRegistered.get((error: any, domains: any[]) => {
                        this.addDomains(domains.filter(event => list.indexOf(event.args.owner) > -1)).then(nothing => this.domainCountSubject.next(this.domains.length));

                        subDomainRegistered.get((error: any, subdomains: any[]) => {
                            this.addSubdomains(subdomains.filter(event => list.indexOf(event.args.owner) > -1)).then(nothing => {
                                this.zone.run(() => {
                                    this.domainCountSubject.next(this.domains.length)
                                });
                            });

                        });
                        subDomainRegistered.watch((error: any, event: any) => {
                            if (list.indexOf(event.args.owner) > -1) {
                                this.addSubdomain(event).then(subDomain => {
                                    this.zone.run(() => {
                                        this.domainCountSubject.next(this.domains.length)
                                    });
                                });
                            }
                        });

                    });
                    domainRegistered.watch((error: any, event: any) => {
                        if (list.indexOf(event.args.owner) > -1) {
                            this.addDomain(event).then(domain => {
                                this.zone.run(() => {
                                    this.domainCountSubject.next(this.domains.length)
                                });
                            })
                        };
                    });
                });
            })
        }
    }

    addDomains(events: any[]): Promise<void> {
        return Promise.all(events.map(event => this.addDomain(event)));
    }

    addDomain(event: any): Promise<Domain> {
        return new Promise((resolve, reject) => {
            var newDomain = new Domain();
            newDomain.name = this.hexToName(event.args.domain);
            newDomain.owner = event.args.owner;
            newDomain.txHash = event.transactionHash;
            newDomain.subdomains = [];
            var old = this.domains.filter(elem => elem.name === newDomain.name)[0];
            if (old) {
                this.domains[this.domains.indexOf(old)] = newDomain;
            } else {
                this.domains.push(newDomain);
            }
            resolve(newDomain);
        });
    }

    hexToName(hex: String): String {
        var str = '';
        for (var n = 0; n < hex.length; n += 2) {
            var integer = parseInt(hex.substr(n, 2), 16);
            if (integer > 0) {
                str += String.fromCharCode(integer);
            }
        }
        return str;
    }

    // Helper function that transform a 4-byte hex string into an IPv4 (XXX.XXX.XXX.XXX)
    hexToIpv4(hex: String) {
        var result: Number[] = [];
        var bytes = hex.substring(2, hex.length);
        for (var i = 0; i < (bytes.length); i += 2) {
            var byte = "0x" + bytes.substring(i, i + 2);
            result.push(parseInt(byte));
        }
        return result.join(".");
    }

    addSubdomains(subdomainsEvents: any[]): Promise<void> {
        return Promise.all(subdomainsEvents.map(event => this.addSubdomain(event)));
    }

    addSubdomain(subdomainEvent: any): Promise<SubDomain> {
        return new Promise((resolve, reject) => {
            var newSubdomain = new SubDomain();
            newSubdomain.txHash = subdomainEvent.transactionHash;
            newSubdomain.name = this.hexToName(subdomainEvent.args.subDomain);
            this.contract.getType(subdomainEvent.args.domain, subdomainEvent.args.subDomain, (err: any, type: any) => {
                newSubdomain.type = type.c[0];
                var addToArray = () => {
                    var storedDomain = this.domains.filter(domain => domain.name === this.hexToName(subdomainEvent.args.domain))[0];
                    if (storedDomain) {
                        var storedSubdomain = storedDomain.subdomains.filter(elem => elem.name === newSubdomain.name)[0];
                        if (storedSubdomain) {
                            storedDomain.subdomains[storedDomain.subdomains.indexOf(storedSubdomain)] = newSubdomain;
                        } else {
                            storedDomain.subdomains.push(newSubdomain);
                        }
                        resolve(newSubdomain);
                    } else {
                        resolve(newSubdomain);
                    }
                }
                switch (newSubdomain.type) {
                    case 1:
                        this.contract.getAlias(subdomainEvent.args.domain, subdomainEvent.args.subDomain, (err: any, alias: String) => {
                            newSubdomain.value = alias;
                            addToArray();
                        });
                        break;
                    case 2:
                        this.contract.getIPV4(subdomainEvent.args.domain, subdomainEvent.args.subDomain, (err: any, ipv4bytes: String) => {
                            newSubdomain.value = this.hexToIpv4(ipv4bytes);
                            addToArray();
                        });
                        break;
                    case 3:
                        //not supported yet, ignore
                        resolve(null);
                        break;
                    default:
                        resolve(null);
                        break;
                }
            })
        });
    }

    hexEncode(string: String): string { //encodes an ASCII string into hexadecimal string
        if (string.length < 1) {
            return "";
        }
        var hex: String;
        var result = "0x";
        for (var i = 0; i < string.length; i++) {
            hex = string.charCodeAt(i).toString(16);
            result += (hex);
        }

        return result
    }

    registerDomain(domainName: String): Promise<any> {
        return new Promise((resolve, reject) => {
            this.contract.registerDomain.sendTransaction(this.hexEncode(domainName), { from: web3.eth.accounts[0] }, (err: any, result: any) => {
                this.zone.run(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            })
        });
    }

    IPV4toHex(value: string): string {
        var parts = value.split(".");
        return "0x" + parts.map(part => {
            var number = parseInt(part);
            return (number > 15 ? "" : "0") + number.toString(16);
        }).join("");
    }

    registerSubdomain(domainName: String, subdomainName: String, type: Number, value: String): Promise<any> {
        return new Promise((resolve, reject) => {
            var then = (err: any, result: any) => {
                this.zone.run(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            };
            var contract = this.contract;
            domainName = this.hexEncode(domainName);
            subdomainName = this.hexEncode(subdomainName);
            switch (type) {

                case 1:
                    this.contract.storeCNAME.sendTransaction(domainName, subdomainName, value.toString(), { from: web3.eth.accounts[0] }, then);
                    break;
                case 2:
                    this.contract.storeIPV4.sendTransaction(domainName, subdomainName, this.IPV4toHex(value.toString()), { from: web3.eth.accounts[0] }, then);
                    break;
                default:
                    reject(new Error("Not supported type"));

            }
        });
    }
}