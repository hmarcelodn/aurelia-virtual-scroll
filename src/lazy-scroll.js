import { inject, bindable, bindingMode, customAttribute, BindingEngine, TaskQueue } from 'aurelia-framework';

@bindable('fetcher')
@bindable({ name: 'storage', defaultValue: [], defaultBindingMode: bindingMode.twoWay  })
@bindable({ name: 'virtualStorage', defaultValue: [], defaultBindingMode: bindingMode.twoWay  })
@bindable({ name: 'slotHeight', defaultValue: 400, defaultBindingMode: bindingMode.oneWay  })
@bindable({ name: 'slotLineHeight', defaultValue: 20, defaultBindingMode: bindingMode.oneWay })
@bindable({ name: 'debug', defaultValue: false, defaultBindingMode: bindingMode.oneWay  })
@bindable({ name: 'windowScroller', defaultValue: true, defaultBindingMode: bindingMode.oneWay  })

@customAttribute("lazy-scroll")
@inject(Element, BindingEngine, TaskQueue)
export class AureliaLazyScroll{
    constructor(element, bindingEngine, taskQueue){
        this.element = element;
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
    }

    attached() {
        this.viewportContainer = document.getElementsByClassName('lazy-scroll-container')[0];
        this.viewportContainer.style.position = 'relative';    

        if(this.windowScroller) { 
            this.scrollContainer = window;
            this.viewportContainer.style.height = (((this.storage.length - 1) * this.slotLineHeight) - this.viewportContainer.offsetTop) + 'px';
            this.slotHeight = window.innerHeight;

            window.addEventListener('scroll', () => {
                if (window.scrollY > this.viewportContainer.offsetTop) {
                    this.computeDimensions(true);
                } else if (window.scrollY - this.lastScrollPosition < 0 && window.scrollY <= this.viewportContainer.offsetTop) {
                    this.computeDimensions(false);
                }

                this.lastScrollPosition = window.scrollY;
            });
        } else {
            this.viewportContainer.style.height = this.slotHeight + 'px';            
            this.viewportContainer.style.overflowY = 'scroll'; 
            this.scrollContainer = this.viewportContainer;

            this.element.style.height = (
                ((this.storage.length - 1) * this.slotLineHeight) - this.viewportContainer.offsetTop) 
                + 'px';   

            this.scrollContainer.addEventListener('scroll', () => {
                //if (window.scrollY > this.viewportContainer.offsetTop) {
                    this.computeDimensions(false);
                //} else if (window.scrollY - this.lastScrollPosition < 0 && window.scrollY <= this.viewportContainer.offsetTop) {
                  //  this.computeDimensions(false);
                //}

                this.lastScrollPosition = window.scrollY;
            });                

        }

        this.taskQueue.queueTask(() => {
            this.computeDimensions(false);
        });
    }

    computeDimensions(fixTop = false) {
        // View Port Mode
        this.scrollY = this.windowScroller ? window.scrollY : this.viewportContainer.scrollTop;
        this.scrollHeight = this.scrollContainer.scrollHeight;
        this.substractDiff = this.scrollHeight - this.scrollY;
        this.numItemsPerPage = Math.max(Math.ceil(this.slotHeight / this.slotLineHeight), 0);

        this.firstVisibleIndex = this.scrollY === 0 ? 
            Math.ceil((this.scrollY) / this.slotLineHeight) : 
            Math.ceil((this.scrollY) / this.slotLineHeight);       

        this.lastVisibleIndex = (this.numItemsPerPage + this.firstVisibleIndex);     

        this.firstVisibleIndex = this.firstVisibleIndex !== 0 ? this.firstVisibleIndex - 1 : this.firstVisibleIndex;   
        this.lastVisibleIndex = this.lastVisibleIndex === this.storage.length ? this.lastVisibleIndex : this.lastVisibleIndex + 1;      

        console.clear();
        console.log('firstVisibleIdex:' + this.firstVisibleIndex);
        console.log('lastVisibleIdex:' + this.lastVisibleIndex);
        
        let vList =  this.storage.slice(this.firstVisibleIndex, this.lastVisibleIndex);

        let initialTop = fixTop ?
                            this.slotLineHeight * (this.firstVisibleIndex - 1) - this.viewportContainer.offsetTop :
                            this.slotLineHeight * this.firstVisibleIndex;

        for(let i = 0; i < vList.length; i++) {
                vList[i].top = (initialTop + (this.slotLineHeight * i)) + 'px';
                vList[i].position = 'absolute';
                vList[i].width = '100%';
        }

        this.virtualStorage = vList;
    }  

    fetchData(){
        this.fetcher().then((data) => {
            for(let i = 0; i < data.length; i++){                        
                this.storage.push(data[i]);   
            }

            this.computeDimensions();
        });
    }

}