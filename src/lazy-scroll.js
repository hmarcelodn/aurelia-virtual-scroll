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
    }

    attached(){             

        //View-Port Mode
        this.element.style.height = this.slotHeight + 'px';
        this.element.style.overflowY = 'hidden';      
            
        let viewportNode = document.createElement('div');
        let viewportSubNode = document.createElement('div');
        this.viewportContainer = document.getElementsByClassName('lazy-scroll-container')[0];
        this.viewportContainer.style.position = 'relative';

        if(this.windowScroller){
            this.viewportContainer.style.height = (this.storage.length * this.slotLineHeight) + 'px'; 
        }
        else{
            this.viewportContainer.style.height = this.slotHeight + 'px';
        }
        
        viewportNode.setAttribute('id', 'viewport');
        viewportSubNode.setAttribute('id', 'viewport-virtual');

        viewportNode.appendChild(viewportSubNode);
        this.element.parentNode.insertBefore(viewportNode, this.element);

        this.viewport = document.getElementById('viewport');
        this.viewportVirtual = document.getElementById('viewport-virtual');

        this.viewport.style.position = 'absolute';
        this.viewport.style.backgroundColor = '#ddd';
        this.viewport.style.width = 'auto';
        this.viewport.style.height = this.slotHeight + 'px';
 
        this.viewport.style.overflowY = 'scroll';
        this.viewport.style.right = 0;
        this.viewport.style.border = '1px solid';

        if(this.windowScroller) {
            this.scrollContainer = window;
        } else {
            this.scrollContainer = this.viewport;
        }

        this.taskQueue.queueTask(() => {
            this.computeDimensions();
        });

        this.element.addEventListener('wheel', (e) => {
            this.viewport.scrollTop += e.deltaY;
            console.log('wheel');
        });

        this.scrollContainer.addEventListener('scroll', () => {
            console.log('scroll');
            console.log('this.substractDiff', this.substractDiff, 'this.slotHeight', this.slotHeight);
            this.computeDimensions();

            if(this.substractDiff <= this.slotHeight){
                this.fetchData();
            }
        });

        // to re render
        // window.addEventListener('wheel', (e) => {
        //     console.log('wheel window');
        // });
        // window.addEventListener('scroll', (e) => {
        //     console.log('WINDOW scroll!');
        // });
    }    

    computeDimensions(){          
        
        // View Port Mode
        this.scrollY = Math.floor(this.viewport.scrollTop);
        this.scrollHeight = this.viewport.scrollHeight;
        console.log('scrollY', this.scrollY);
        console.log('scrollHeight', this.scrollHeight);

        this.substractDiff = this.scrollHeight - this.scrollY;
        this.numItemsPerPage = Math.max(Math.ceil(this.slotHeight / this.slotLineHeight), 0);

        this.firstVisibleIndex = this.scrollY === 0 ? 
            Math.ceil((this.scrollY) / this.slotLineHeight) : 
            Math.ceil((this.scrollY) / this.slotLineHeight);       

        this.lastVisibleIndex = (this.numItemsPerPage + this.firstVisibleIndex);     

        this.viewportVirtual.style.height = (this.storage.length * this.slotLineHeight) + 'px';
        this.viewportVirtual.style.border = '1px solid red';

        console.clear();
        console.log('firstVisibleIdex:' + this.firstVisibleIndex);
        console.log('lastVisibleIdex:' + this.lastVisibleIndex);

        this.virtualStorage = this.storage.slice(this.firstVisibleIndex, this.lastVisibleIndex);
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