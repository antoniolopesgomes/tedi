import * as inversify from 'inversify';
import {CoreRouteManager} from './routes';
import {FilterManager, CoreFilterManager} from './filters';

let ioc = new inversify.Kernel();
let controllerKernel = new inversify.Kernel();
let filterKernel = new inversify.Kernel();

//initial bindings
ioc.bind<FilterManager>('FilterManager').to(CoreFilterManager);

class GlobalRegister {
     
    registerController<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T>,
        singleton: boolean = true
    ): GlobalRegister {
        bindToKernel(controllerKernel, abstraction, concretion, singleton)
        return this;
    }
    
    registerFilter<T>(
        abstraction: string | inversify.INewable<T>, 
        concretion: inversify.INewable<T>,
        singleton: boolean = true
    ): GlobalRegister {
        bindToKernel(filterKernel, abstraction, concretion, singleton)
        return this;
    }
    
    getController<T>(abstraction: string | inversify.INewable<T>): T {
        return controllerKernel.get<T>(abstraction);
    }
    
    getFilter<T>(abstraction: string | inversify.INewable<T>): T {
        return controllerKernel.get<T>(abstraction);
    }
    
}

function bindToKernel<T>(
    kernel: inversify.IKernel,
    abstraction: string | inversify.INewable<T>, 
    concretion: inversify.INewable<T>,
    singleton: boolean = true
): void {
    let binding = kernel.bind<T>(abstraction).to(concretion);
    if (singleton) {
        binding.inSingletonScope();
    }   
}

export let Global: GlobalRegister = new GlobalRegister();