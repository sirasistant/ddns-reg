
export class Domain{
    name:String;
    owner:String;
    subdomains:SubDomain[];
    txHash:String;
}

export class SubDomain{
    name:String;
    type:Number;
    value:String;
    txHash:String;
}