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
@bindable({ name: 'breakpoints', defaultValue: [], defaultBindingMode: bindingMode.oneWay })

@noView()
@customAttribute("lazy-scroll")
@inject(Element, BindingEngine, TaskQueue, ViewCompiler, ViewResources, Container)
export class AureliaLazyScroll{
    constructor(element, bindingEngine, taskQueue, viewCompiler, viewResources, container){
        
        // Aurelia Dependencies
        this.element = element;
        this.viewCompiler = viewCompiler;
        this.viewResources = viewResources;
        this.container = container;

        // Model
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
    }

    attached() {

        this.viewSlot = new ViewSlot(this.element, true);
        this.viewportContainer = document.getElementsByClassName(this.viewportElement)[0];
        this.viewportContainer.style.position = 'relative';

        if(this.windowScroller) { 
            this.scrollContainer = window;
            this.viewportContainer.style.height = (((this.storage.length - 1) * this.slotLineHeight) - this.viewportContainer.offsetTop) + 'px';
            this.slotHeight = window.innerHeight;

            // Its buggy. It needs a timer for avoid multiple firing.
            window.addEventListener('scroll', () => {              
                if (window.scrollY > this.viewportContainer.offsetTop) {
                    this.computeDimensions(true);
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
        });
    }

    computeDimensions(fixTop = false) {
        this.scrollY = this.windowScroller ? window.scrollY : this.viewportContainer.scrollTop;
        this.scrollHeight = this.scrollContainer.scrollHeight;        

        this.numItemsPerPage = Math.max(Math.ceil(this.slotHeight / this.slotLineHeight), 0);

        this.firstVisibleIndex = Math.ceil((this.scrollY) / this.slotLineHeight);      
        this.lastVisibleIndex = (this.numItemsPerPage + this.firstVisibleIndex);     

        this.firstVisibleIndex = this.firstVisibleIndex !== 0 ? this.firstVisibleIndex - 1 : this.firstVisibleIndex;   
        this.lastVisibleIndex = this.lastVisibleIndex === this.storage.length ? this.lastVisibleIndex : this.lastVisibleIndex + 2;      

        console.log('firstVisibleIdex:' + this.firstVisibleIndex);
        console.log('lastVisibleIdex:' + this.lastVisibleIndex);
          
        this.virtualStorage =  this.storage.slice(this.firstVisibleIndex, this.lastVisibleIndex);

        let initialTop = fixTop ?
                         this.slotLineHeight * (this.firstVisibleIndex - 1) - this.viewportContainer.offsetTop :
                         this.slotLineHeight * this.firstVisibleIndex;        

        for(let i = 0; i < this.virtualStorage.length; i++) {
            this.virtualStorage[i].top = (initialTop + (this.slotLineHeight * i)) + 'px';
        }                        
        
        this.rowBuilder();
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
        this.viewportContainer.style.height = (((this.storage.length - 1) * this.slotLineHeight) - this.viewportContainer.offsetTop) + 'px';
    }

    fetchData(){
        this.fetcher().then((data) => {
            for(let i = 0; i < data.length; i++){                        
                this.storage.push(data[i]);   
            }

            this.resizeViewPortContainer();
            this.computeDimensions();
        });
    }    

    rowBuilder(){        
        this.viewSlot.removeAll(true, true);

        for(let i = 0; i < this.virtualStorage.length; i++) {
            let viewFactory = this.viewCompiler.compile(
                '<template>' + 
                    '<div class="aurelia-v-scroll-row" style="height: ' + this.slotLineHeight + 'px; border: 1px solid; position: absolute; left: 0px; top: ' + this.virtualStorage[i].top + '; width: 100%">' + 
                       this.callback() + 
                    '</div>' + 
                '</template>'
            );
        
            let view = viewFactory.create(this.element);  

            this.viewSlot.add(view);        
            view.bind(this.virtualStorage[i], createOverrideContext(this.virtualStorage[i]));
            view.attached();
        }

    }

}