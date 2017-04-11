import { 
    inject, 
    noView,
    bindable, 
    bindingMode, 
    customAttribute, 
    BindingEngine, 
    TaskQueue,
    ViewCompiler,
    ViewResources,
    Container,
    ViewSlot,
    createOverrideContext    
} from 'aurelia-framework';

@bindable('fetcher')
@bindable({ name: 'storage', defaultValue: [], defaultBindingMode: bindingMode.twoWay  })
@bindable({ name: 'slotHeight', defaultValue: 400, defaultBindingMode: bindingMode.oneWay  })
@bindable({ name: 'slotLineHeight', defaultValue: 20, defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'debug', defaultValue: false, defaultBindingMode: bindingMode.oneWay  })
@bindable({ name: 'windowScroller', defaultValue: true, defaultBindingMode: bindingMode.oneWay  })
@bindable({ name: 'viewportElement', defaultValue: undefined, defaultBindingMode: bindingMode.oneWay  })
@bindable({ name: 'callback', defaultValue: undefined, defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'headerCallback', defaultValue: undefined, defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'breakpoints', defaultValue: [], defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'enableFetchMode', defaultValue: false, defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'fetchBuffer', defaultValue: 1, defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'arrayPollingMode', defaultValue: false, defaultBindingMode: bindingMode.oneWay })

@noView()
@customAttribute("v-scroll")
@inject(Element, BindingEngine, TaskQueue, ViewCompiler, ViewResources, Container)
export class AureliaVirtualScroll{
    constructor(element, bindingEngine, taskQueue, viewCompiler, viewResources, container){
        
        // Aurelia Dependencies
        this.element = element;
        this.viewCompiler = viewCompiler;
        this.viewResources = viewResources;
        this.container = container;

        // Model
        this.useHeader = false;
        this.scrollTop;
        this.scrollHeight;
        this.substractDiff;
        this.numItemsPerPage;        
        this.bindingEngine = bindingEngine;
        this.taskQueue = taskQueue;
        this.firstVisibleIndex;
        this.lastVisibleIdex;    
        this.viewport;
        this.viewportVirtual;
        this.viewportContainer;
        this.scrollContainer;        
        this.ticking = false;
        this.lastScrollPosition = 0;

        //Compiler
        this.viewSlot;

        // Resposive
        this.currentBreakPoint;

        // Polling arrayPollingMode
        this.lastPollingArrayCount;
    }

    // Binding Parent ViewModel
    bind(bindingContext){
        this.bindingContext = bindingContext;
    }

    attached() {

        if(this.headerCallback !== undefined && typeof this.headerCallback === "function"){
            this.useHeader = true;
        }

        this.viewSlot = new ViewSlot(this.element, true);
        this.viewportContainer = document.getElementsByClassName(this.viewportElement)[0];
        this.viewportContainer.style.position = 'relative';

        if(this.windowScroller) { 
            this.scrollContainer = window;

            //this.viewportContainer.style.height = (((this.storage.length - 2) * this.slotLineHeight) + this.viewportContainer.offsetTop);
            this.viewportContainer.style.height = (((this.storage.length) * this.slotLineHeight));
            this.slotHeight = window.innerHeight;

            // Its buggy. It needs a timer for avoid multiple firing.
            window.addEventListener('scroll', () => {              
                if (window.scrollY > this.viewportContainer.offsetTop) {
                    this.computeDimensions(false);
                } else if (window.scrollY - this.lastScrollPosition < 0 && window.scrollY <= this.viewportContainer.offsetTop) {
                    this.computeDimensions(false);
                }

                this.lastScrollPosition = window.scrollY;                
            });          
        } 
        else {
            this.viewportContainer.style.height = this.slotHeight + 'px';            
            this.viewportContainer.style.overflowY = 'scroll'; 
            this.scrollContainer = this.viewportContainer;

            this.element.style.height = (
                ((this.storage.length - 1) * this.slotLineHeight) - this.viewportContainer.offsetTop) + 'px';   

            this.scrollContainer.addEventListener('scroll', () => {
                this.computeDimensions(false);
            });                
        }        

        // Responsive Design
        window.addEventListener('resize', this.detectBreakPoints.bind(this));

        this.taskQueue.queueTask(() => {                      
            this.computeDimensions(false);      
            this.detectBreakPoints();                 
        }); 

        if(this.arrayPollingMode){
            this.lastPollingArrayCount = this.storage.length;
            window.setInterval(() => {

                if(this.lastPollingArrayCount != this.storage.length){
                    this.lastPollingArrayCount = this.storage.length;
                    this.resizeViewPortContainer();                    
                }
            }, 200);
        }

    }

    computeDimensions(fixTop = false) {

        this.scrollY = this.windowScroller ? window.scrollY : this.viewportContainer.scrollTop;

        // Window Scroll Considering Content Above
        if(this.windowScroller){
            if(this.scrollY >= this.viewportContainer.offsetTop){
                this.scrollY = this.scrollY - this.viewportContainer.offsetTop;
            }
        }

        this.scrollHeight = this.scrollContainer.scrollHeight;        

        this.numItemsPerPage = Math.max(Math.ceil(this.slotHeight / this.slotLineHeight), 0);

        this.firstVisibleIndex = Math.ceil((this.scrollY) / this.slotLineHeight);      
        this.lastVisibleIndex = (this.numItemsPerPage + this.firstVisibleIndex);             

        this.firstVisibleIndex = this.firstVisibleIndex > 3 ? 
                                 this.firstVisibleIndex - 3 : 
                                 0;   

        this.lastVisibleIndex = this.lastVisibleIndex === this.storage.length ? 
                                this.lastVisibleIndex : 
                                this.lastVisibleIndex + 2;      

        // If Overflow exceeds the max storage length assign storage length as last item to be shown.
        if(this.lastVisibleIndex > this.storage.length){
            this.lastVisibleIndex = this.storage.length;
        }

        //console.clear();
        console.log('firstVisibleIdex:' + this.firstVisibleIndex);
        console.log('lastVisibleIdex:' + this.lastVisibleIndex);
          
        this.virtualStorage =  this.storage.slice(this.firstVisibleIndex, this.lastVisibleIndex);

        let initialTop = fixTop ?
                         this.slotLineHeight * (this.firstVisibleIndex - 1) - this.viewportContainer.offsetTop :
                         (this.slotLineHeight * this.firstVisibleIndex);  

        if(this.useHeader && !this.firstVisibleIndex) {
            initialTop =+ this.slotLineHeight;
        }          

        for(let i = 0; i < this.virtualStorage.length; i++) {
            this.virtualStorage[i].top = (initialTop + (this.slotLineHeight * i))  + 'px';            
        }                        
        
        // Row rowBuilder
        this.rowBuilder();
        
        // Using Headers
        if(this.useHeader && !this.firstVisibleIndex) {
            this.headerBuilder();
        }

        // Fetch Mode
        if(this.enableFetchMode){
            let fetchBuffer = this.storage.length - this.fetchBuffer;

            if(this.lastVisibleIndex >= fetchBuffer){
                this.fetchData();
            }
        }
    }  

    detectBreakPoints(){
        if(
            (this.currentBreakPoint != undefined && this.currentBreakPoint != null ) && 
                (window.innerWidth >= this.currentBreakPoint.breakpointFrom && 
                 window.innerWidth <= this.currentBreakPoint.breakpointTo)
            ){
            return;
        }

        for(let i = 0; i < this.breakpoints.length; i++){
            if(window.innerWidth >= this.breakpoints[i].breakpointFrom && window.innerWidth <= this.breakpoints[i].breakpointTo){
                let breakpointConfig = this.breakpoints[i];
                
                this.currentBreakPoint = breakpointConfig;
                this.slotLineHeight = breakpointConfig.height;
                
                this.resizeViewPortContainer();
                this.computeDimensions(false);
            }
        }
    }

    resizeViewPortContainer(){
        if(this.windowScroller){
            if(this.viewportContainer !== undefined){
                //let newHeight = (((this.storage.length) * this.slotLineHeight) + this.viewportContainer.offsetTop);           
                let newHeight = (((this.storage.length) * this.slotLineHeight));        
                this.viewportContainer.style.height = newHeight < 0 ? 0  + 'px' : newHeight + 'px';
                this.computeDimensions(); 
            }
        }
        else{
            if(this.element.style.height !== ""){
                let newHeight = (((this.storage.length - 1) * this.slotLineHeight) - this.viewportContainer.offsetTop);
                this.element.style.height = newHeight < 0 ? 0 + 'px': newHeight + 'px';
                this.computeDimensions(); 
            }
        }      
    }

    fetchData(){
        let scrollContext = {
            firstItem: this.virtualStorage[0],
            lastItem: this.virtualStorage[this.virtualStorage.length - 1],
            firstVisibleIndex: this.firstVisibleIndex,
            lastVisibleIndex: this.lastVisibleIndex
        };

        this.fetcher(scrollContext).then((data) => {
            for(let i = 0; i < data.length; i++){                        
                this.storage.push(data[i]);   
            }

            this.resizeViewPortContainer();
        });
    }    

    rowBuilder(){        
        this.viewSlot.removeAll(true, true);

        for(let i = 0; i < this.virtualStorage.length; i++) {
            let viewFactory = this.viewCompiler.compile(
                '<template>' + 
                    '<div class="aurelia-virtual-scroll-row" style="height: ' + this.slotLineHeight + 'px; border: 1px solid; position: absolute; left: 0px; top: ' + this.virtualStorage[i].top + '; width: 100%">' + 
                       this.callback(this.virtualStorage[i]) + 
                    '</div>' + 
                '</template>'
            );
        
            let view = viewFactory.create(this.element);  

            this.viewSlot.add(view);        
            view.bind(this.bindingContext, createOverrideContext(this.virtualStorage[i]));
            view.attached();
        }

    }

    headerBuilder(){        
     
        let viewFactory = this.viewCompiler.compile(
            '<template>' + 
                '<div class="aurelia-virtual-scroll-header" style="height: ' + this.slotLineHeight + 'px; border: 1px solid; position: absolute; left: 0px; top: ' + '0px' + '; width: 100%">' 
                    + this.headerCallback() +
                '</div>' + 
            '</template>'
        );
    
        let view = viewFactory.create(this.element);  

        this.viewSlot.insert(0,view);        
        view.bind(this.bindingContext, createOverrideContext(this.virtualStorage[0]));
        view.attached();        
    }

    storageChanged(splices){
        this.resizeViewPortContainer();              
    }

}