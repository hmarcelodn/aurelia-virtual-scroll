export class Test{
    constructor(){
        this.list = [];
        this.vlist = [];

        for(let i = 0; i < 10000; i++) {
            this.list.push({propertyOne: 'Test' + i});
        }
    }
    
    fetcher(){
        return new Promise((resolve, reject) => {
           return resolve([{ "propertyOne": "Test" }]); 
        });        
    }

    buildRowCallback(){
        console.log("Hello World!");

        return "<div>${propertyOne} + ${propertyOne}</div>";
    }

}