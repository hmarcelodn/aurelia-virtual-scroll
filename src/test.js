export class Test{
    constructor(){
        this.list = [];
        this.vlist = [];
        this.domElements = 0;

        for(let i = 0; i < 10000; i++) {
            this.list.push({propertyOne: 'Test' + i});
        }

        let updateDom = () => {
            this.domElements = $('.aurelia-v-scroll-row').length;
        };

        setInterval(function(){ 
            updateDom();
        }, 300);

    }
    
    fetcher(){
        return new Promise((resolve, reject) => {
           return resolve([{ "propertyOne": "Test" }]); 
        });        
    }

    buildRowCallback(){
        // I can use jsx in order to avoid string html
        return "<div>${propertyOne}</div>";
    }

}