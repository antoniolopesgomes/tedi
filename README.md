# Overview

#### [Check the wiki](https://github.com/antoniolopesgomes/tedi/wiki)

### Typescript
**tedi** tries to give a new approach about how we write web applications in node.
It favors the typescript language to leverage the power of javascript into new heights. Typescript is a superset of javascript that allows us to use the ES6 (and some of the ES7) spec, today. It also gives us types - we can work in a strongly typed environment.
(**tedi** will only work with a typescript version >= 2.0.0)  
[Typescript](https://www.typescriptlang.org/)

### Express  
express is a great web framework that is already well established in the community and has great support. **tedi** is not trying to reinvent the wheel here, instead it tries to wrap express's power defining a new approach in terms of architecture using classes, types, and dependency injection as core principles.  
[Express](http://expressjs.com/)

### Dependency injection  
[wikipedia] dependency injection is a software pattern that implements inversion of control for resolving dependencies.

This is a great way to increase modularity and testability right from the start, as **tedi** forces this pattern to be used. **tedi** uses [inversify.io](http://inversify.io/) as the DI engine. It is a great framework that is actively maintained and I'll be glad to incorporate new functionalities that may arise with new releases.  
[Inversify.io](http://inversify.io/)  

Installation
---
Create a project folder.
```bash
$ mkdir tedi-project
$ cd tedi-project
```
Initialize npm.  
```bash
$ npm init
```
Install tedi and other dependencies.
```bash
$ npm i --save tedi
$ npm i --save-dev typescript@">=2.0.0"
```
typescript version must be greater or equal to 2.0.
___
**tsconfig.json**  (put it in the project root folder)
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "moduleResolution": "node",
        "noImplicitAny": false,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    },
    "exclude": [
        "node_modules"
    ]
}
```
Compile
---
You can now compile your .ts files.
```bash
$ node_modules/.bin/tsc
```
Or you can define a npm script.

**package.json**
```json
"scripts": {
  "compile": "node_modules/.bin/tsc"
},
```
Use the command to compile.
```bash
$ npm run compile
```
___
Next step: [Tutorial](https://github.com/antoniolopesgomes/tedi/wiki/1.-Tutorial)
