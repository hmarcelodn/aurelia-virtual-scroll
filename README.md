# aurelia-virtual-scroller

## Virtualize the list

**aurelia-virtual-scroller** allows to virtualize a list without losing you observer model context. It will help to reduce significantly the render time from the browser from lineal to constant time. It its mobile friendly (the reason it was created for) and with some configurations that allows to use this plugin in a responsive design application. Its open source and everybody can collaborate with its code base to improve and have a better plugin.


**Demo**

[http://aurelia-virtual-scroll-site.azurewebsites.net](http://aurelia-virtual-scroll-site.azurewebsites.net "Demo Azure Site")


**Installation**

    npm install aurelia-virtual-scroller --save

Open your package.json adding the following lines:

    "aurelia": {
    	"build": {
      		"resources": [
        		"aurelia-virtual-scroll/aurelia-virtual-scroll"
      		]
    	}
	}
  	

All samples below refer to the plugin demo site configuration.

**Window Scroll Setup**

    <div class="lazy-scroll-container" style="border: 1px solid yellow;">
        <div v-scroll="slot-height.bind: 400;
                          slot-line-height.bind: 60;
                          fetcher.bind: fetcher;
                          storage.bind: list;
                          debug.bind: true;
                          window-scroller.bind: true;
                          viewport-element.bind: 'lazy-scroll-container';
                          callback.bind: buildRowCallback;
                          breakpoints.bind: 
                            [
                                { breakpointFrom: 400, breakpointTo: 900, height: 150 },
                                { breakpointFrom: 100, breakpointTo: 399, height: 200 },
                                { breakpointFrom: 900, breakpointTo: 3000, height: 60 }
                            ];
                         enable-fetch-mode.bind: false;
                         fetch-buffer.bind: 20">  
        </div>
    </div>  

**Window + Polling Scroll Setup**

    <div class="lazy-scroll-container">
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
                                { breakpointFrom: 400, breakpointTo: 900, height: 150 },
                                { breakpointFrom: 100, breakpointTo: 399, height: 200 },
                                { breakpointFrom: 900, breakpointTo: 3000, height: 70 }
                            ];
                         enable-fetch-mode.bind: false;
                         fetch-buffer.bind: 20;
                         array-polling-mode: true">  
        </div>
    </div>   

**Window + Fetch Scroll Setup**

aurelia-virtual-scroller is a custom-attribute you can add to a markup section when you want to virtualize an observable list. Below is a full configuration example:

    <div class="lazy-scroll-container" style="border: 1px solid yellow;">
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
                                { breakpointFrom: 400, breakpointTo: 900, height: 150 },
                                { breakpointFrom: 100, breakpointTo: 399, height: 200 },
                                { breakpointFrom: 900, breakpointTo: 3000, height: 70 }
                            ];
                         enable-fetch-mode.bind: true;
                         fetch-buffer.bind: 20">  
        </div>
    </div>  


**Window + Headers Scroll Setup**

    <div class="lazy-scroll-container" style="border: 1px solid yellow;">
        <div v-scroll="slot-height.bind: 400;
                          slot-line-height.bind: 60;
                          fetcher.bind: fetcher;
                          storage.bind: list;
                          debug.bind: true;
                          window-scroller.bind: true;
                          viewport-element.bind: 'lazy-scroll-container';
                          callback.bind: buildRowCallback;
                          breakpoints.bind: 
                            [
                                { breakpointFrom: 400, breakpointTo: 900, height: 150 },
                                { breakpointFrom: 100, breakpointTo: 399, height: 200 },
                                { breakpointFrom: 900, breakpointTo: 3000, height: 60 }
                            ];
                         enable-fetch-mode.bind: false;
                         fetch-buffer.bind: 20;
                         header-callback.bind: buildHeaderCallback;">  
        </div>
    </div>  

**Contained Scroll Setup**

     <div class="lazy-scroll-container" style="border: 1px solid yellow;">
        <div v-scroll="slot-height.bind: 400;
                          slot-line-height.bind: 70;
                          fetcher.bind: fetcher;
                          storage.bind: list;
                          debug.bind: true;
                          window-scroller.bind: false;
                          viewport-element.bind: 'lazy-scroll-container';
                          callback.bind: buildRowCallback;
                          breakpoints.bind: 
                            [
                                { breakpointFrom: 400, breakpointTo: 900, height: 150 },
                                { breakpointFrom: 100, breakpointTo: 399, height: 200 },
                                { breakpointFrom: 900, breakpointTo: 3000, height: 70 }
                            ];
                         enable-fetch-mode.bind: true;
                         fetch-buffer.bind: 20">         
        </div>
    </div> 

**Parameters Table**

1. ***slot-height:*** If you want to virtualize a container you need to specify in pixels the total height for that container. (Mandatory for contained scroll)
2. ***slot-line-height:*** Its the initial height for every row. Its specific and any content overflowed will be hidden. If you want to support responsive behavior check the breakpoints option. 
3. ***fetcher:*** A function that will be called by the plugin for infinite scroll support.
4. ***storage***: An observable array to virtualize into the container. 
5. ***debug***: Enable console information from the plugin. 
6. ***window-scroller:*** Enable full window virtualization. 
7. ***callback:*** A callback passed that can be used for build the row. Its a required parameter which returns a string type that supports aurelia syntax since the plugin will compile that. It retuns a promise. 
8. ***headerCallback***: A callback which will be return a string with the template for a header.
8. ***breakpoints:*** Specify for a width range which height will the rows measure. 
9. ***enableFetchMode:*** Turn on infinite scroll functionality. In order to have this working its required to pass fetcher a function which returns a promise.
10. ***fetchBuffer:***: This indicates tha buffer below visible area to start fetching further data. If the scroll is getting the last item in the buffer then it will invoke the fetcher callback in order to retrieve extra data. Always try to keep this number low to render as less as possible items. 
11. ***arrayPollingMode***: If the array passed to storage function is overwritten then the screen and scroll will be re-computed. If the array is not overwritten but changes are happenning like searches then set this value to true so the plugin will poll every 200 ms to the array in order to check its length. If the length changed the screen will be computed. 


**Callback Parameter Sample**

     buildRowCallback(item, itemIndex, firstIndex, lastIndex){
        return "<div class='row'>" +
                 "<div class='col-sm-4'><img class='img-responsive' src='http://vignette3.wikia.nocookie.net/wreckitralph/images/5/58/Blinky8bit.png/revision/latest?cb=20130625170114' class='img-rounded' alt='Red Phantom' width='40' height='40'></div>" +
                 "<div class='col-sm-4 text-center'><a href='#' click.trigger='navigate()'>${propertyOne}</a></div>" +
                 "<div class='col-sm-4'><input class='form-control' type='text' value.bind='propertyOne' /></div>" +
               "</div>";     
    }

**Fetcher Sample**

    fetcher(){
        return new Promise((resolve, reject) => {
           return resolve([{ "propertyOne": "Test" }]); 
        });        
    }

**Header Callback Sample**

    buildHeaderCallback(){
        return "<div class='row'>" +
                 "<div class='col-sm-4'>Image</div>" +
                 "<div class='col-sm-4'>Text</div>" +
                 "<div class='col-sm-4'>Editor</div>" +
               "</div>";
    }