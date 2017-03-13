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
    }

    attached(){             

        //View-Port Mode
        this.element.style.height = this.slotHeight + 'px';
        this.element.style.overflowY = 'hidden';      
            
        let viewportNode = document.createElement('div');
        let viewportSubNode = document.createElement('div');
        this.viewportContainer = document.getElementsByClassName('lazy-scroll-container')[0];
        this.viewportContainer.style.position = 'relative';
        
        viewportNode.setAttribute('id', 'viewport');
        viewportSubNode.setAttribute('id', 'viewport-virtual');

        viewportNode.appendChild(viewportSubNode);
        this.element.parentNode.insertBefore(viewportNode, this.element);

        this.viewport = document.getElementById('viewport');
        this.viewportVirtual = document.getElementById('viewport-virtual');

        this.viewport.style.position = 'absolute';
        this.viewport.style.backgroundColor = '#ddd';
        this.viewport.style.width = 'auto';

        this.viewport.style.right = 0;

        if(this.windowScroller) { 
            this.scrollContainer = window;
            this.viewportContainer.style.height = (this.storage.length * this.slotLineHeight) + 'px';
            this.slotHeight = window.innerHeight;
            // Add resize
            window.addEventListener('resize', () => {

            });

        } else {
            this.viewportContainer.style.height = this.slotHeight + 'px';
            this.scrollContainer = this.viewport;
            this.viewport.style.overflowY = 'scroll';
            this.viewport.style.height = this.slotHeight + 'px';
        }

        this.taskQueue.queueTask(() => {
            this.computeDimensions();
        });

        this.element.addEventListener('wheel', (e) => {
            this.viewport.scrollTop += e.deltaY;
        });

        this.scrollContainer.addEventListener('scroll', () => {
            this.computeDimensions();
            this.setFixedList();
            if(this.substractDiff <= this.slotHeight){
                this.fetchData();
            }
        });

        // Test later for better performance on window scroll event
        // window.addEventListener('scroll', function(e) {
        //     if (!this.ticking) {
        //         window.requestAnimationFrame(function() {

        //             this.computeDimensions();
        //             this.setFixedList();
        //             if(this.substractDiff <= this.slotHeight){
        //                 this.fetchData();
        //             }

        //             this.ticking = false;
        //         }.bind(this));
        //     }
        //     this.ticking = true;
        // }.bind(this));
    }

    setFixedList() {
        if (this.windowScroller) {
            if (this.scrollContainer.scrollY > this.viewportContainer.offsetTop) {
                this.element.style.position = 'fixed';
                this.element.style.top = '0';
            } else {
                this.element.style.removeProperty('position'); // TODO replace with previous
            }
        }
    }

    computeDimensions() {
        // View Port Mode
        this.scrollY = this.windowScroller ? this.scrollContainer.scrollY : this.viewport.scrollTop;
        this.scrollHeight = this.scrollContainer.scrollHeight;
        console.log('scrollY', this.scrollY);
        console.log('scrollHeight', this.scrollHeight);

        this.substractDiff = this.scrollHeight - this.scrollY;
        this.numItemsPerPage = Math.max(Math.ceil(this.slotHeight / this.slotLineHeight), 0);

        this.firstVisibleIndex = this.scrollY === 0 ? 
            Math.ceil((this.scrollY) / this.slotLineHeight) : 
            Math.ceil((this.scrollY) / this.slotLineHeight);       

        this.lastVisibleIndex = (this.numItemsPerPage + this.firstVisibleIndex);     

        this.viewportVirtual.style.height = (this.storage.length * this.slotLineHeight) + 'px';

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