# aurelia-virtual-scroller

## Virtualize the list

**aurelia-virtual-scroller** allows to virtualize a list without losing you observer model context. It will help to reduce significantly the render time from the browser from lineal to constant time. It its mobile friendly (the reason it was created for) and with some configurations that allows to use this plugin in a responsive design application. Its open source and everybody can collaborate with its code base to improve and have a better plugin.


**Demo**

[http://aurelia-virtual-scroll-site.azurewebsites.net](http://aurelia-virtual-scroll-site.azurewebsites.net "Demo Azure Site")


**Installation**

    npm install aurelia-virtual-scroller --save


**Usage**

aurelia-virtual-scroller is a custom-attribute you can add to a markup section when you want to virtualize an observable list. Below is a full configuration example:

           <div v-scroll="slot-height.bind: 400;
                          slot-line-height.bind: 70;
                          fetcher.bind: fetcher;
                          storage.bind: list;
                          debug.bind: true;
                          window-scroller.bind: true;
                          viewport-element.bind: 'lazy-scroll-container';
                          callback.bind: buildRowCallback;
                          breakpoints.bind: 
                            [
                                { breakpointFrom: 400, breakpointTo: 900, height: 100 },
                                { breakpointFrom: 100, breakpointTo: 399, height: 200 },
                                { breakpointFrom: 900, breakpointTo: 3000, height: 70 }
                            ];">         
        </div>


**Parameters Table**

1. ***slot-height:*** If you want to virtualize a container you need to specify in pixels the total height for that container.
2. ***slot-line-height:*** Its the initial height for every row. Its specific and any content overflowed will be hidden. If you want to support responsive behavior check the breakpoints option.
3. ***fetcher:*** A function that will be called by the plugin for infinite scroll support.
4. ***storage***: An observable array to virtualize into the container.
5. ***debug***: Enable console information from the plugin.
6. ***window-scroller:*** Enable full window virtualization.
7. ***callback:*** A callback passed that can be used for build the row. Its a required parameter which returns a string type that supports aurelia syntax since the plugin will compile that. It retuns a promise.
8. ***breakpoints:*** Specify for a width range which height will the rows measure.

**Callback Parameter Sample**

    buildRowCallback(item){
           return "<div>${propertyOne}</div>";   
    }

**Fetcher Sample**

    fetcher(){
        return new Promise((resolve, reject) => {
           return resolve([{ "propertyOne": "Test" }]); 
        });        
    }
