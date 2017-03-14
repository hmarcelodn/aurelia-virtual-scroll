export class Test{
    constructor(){
        this.list = [
                { "propertyOne": "Test1" }, 
                { "propertyOne": "Test2" },
                { "propertyOne": "Test3" },
                { "propertyOne": "Test4" },
                { "propertyOne": "Test5" },
                { "propertyOne": "Test6" },
                { "propertyOne": "Test7" },
                { "propertyOne": "Test8" },
                { "propertyOne": "Test9" },
                { "propertyOne": "Test10" },
                { "propertyOne": "Test11" },
                { "propertyOne": "Test12" },
                { "propertyOne": "Test13" },
                { "propertyOne": "Test14" },
                { "propertyOne": "Test15" },
                { "propertyOne": "Test16" },
                { "propertyOne": "Test17" },
                { "propertyOne": "Test18" },
                { "propertyOne": "Test19" },     
                { "propertyOne": "Test20" }, 
                { "propertyOne": "Test21" },
                { "propertyOne": "Test22" },
                { "propertyOne": "Test23" },
                { "propertyOne": "Test24" },
                { "propertyOne": "Test25" },
                { "propertyOne": "Test26" },
                { "propertyOne": "Test27" },
                { "propertyOne": "Test28" },
                { "propertyOne": "Test29" },
                { "propertyOne": "Test30" },
                { "propertyOne": "Test31" },
                { "propertyOne": "Test32" },
                { "propertyOne": "Test33" },
                { "propertyOne": "Test34" },
                { "propertyOne": "Test35" },
                { "propertyOne": "Test36" },
                { "propertyOne": "Test37" },
                { "propertyOne": "Test38" },                                                                                                                                                                            
                { "propertyOne": "Test39" },
                { "propertyOne": "Test40" },                      
        ];
        this.vlist = [];

        for(let i = 0; i < 1000; i++) {
            this.list.push({propertyOne: 'Test' + i});
        }
    }
    
    fetcher(){
        return new Promise((resolve, reject) => {
           return resolve([{ "propertyOne": "Test" }]); 
        });        
    }
}