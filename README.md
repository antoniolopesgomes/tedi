#Overview

####Check the [wiki](https://github.com/antoniolopesgomes/tedi/wiki) (under development)

###Typescript
**tedi** tries to give a new approach about how we write web applications in node.
It favors the typescript language to leverage the power of javascript into new heights. Typescript is a superset of javascript that allows us to use the ES6 (and some of the ES7) spec, today. It also gives us types - we can work in a strongly typed environment.  
[Typescript](https://www.typescriptlang.org/)

###Express  
express is a great web framework that is already well established in the community and has great support. **tedi** is not trying to reinvent the wheel here, instead it tries to wrap express's power defining a new approach in terms of architecture using classes, types, and dependency injection as core principles.  
[Express](http://expressjs.com/)

###Dependency injection  
[wikipedia] dependency injection is a software pattern that implements inversion of control for resolving dependencies.


This is a great way to increase modularity and testability right from the start, as **tedi** forces this pattern to be used. **tedi** uses [inversify.io](http://inversify.io/) as the DI engine. It is a great framework that is actively maintained and I'll be glad to incorporate new functionalities that may arise with new releases.  
[Inversify.io](http://inversify.io/)  
