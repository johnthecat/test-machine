<div style="text-align: center">
<img/>
<br/>
<br/>
Quick links:
<br/>
<a href="https://github.com/johnthecat/test-machine/tree/master/packages/test-machine-core">Core</a>
|
<a href="https://github.com/johnthecat/test-machine/tree/master/packages/test-machine-webpack">Webpack plugin</a>
|
<a href="https://github.com/johnthecat/test-machine/tree/master/packages/test-machine-plugins">Engines and compilers</a>
<hr/>
</div>

Test machine is easy to use [bundler ↔ test runner] adapter, that makes all dirty job for you.

Features:
* Simple API;
* Supporting multiple test runners (Mocha, Jasmine);
* Fast test running right inside your build process;
* Incremental test running;
* Powerful plugin system;
* Easy integration with tools like Istanbul.

## Features

### Simple and flexible API

#### Install

`npm install test-machine-webpack test-machine-plugins --save-dev`

#### Usage

This is webpack plugin API example

```javascript
const path = require('path');
const {TestMachineWebpack} = require('test-machine-webpack');
const {compiler, engine} = require('test-machine-plugins');

module.exports = {
    plugins: [
        new TestMachineWebpack({
        
            // Required
            
            testRoot: './tests',
            
            engine: engine.mocha({
                reporter: 'tap',
                timeout: 3000
            }),
            
            // Not required
            
            router(resource) {
                return `**/*${resource.name}.spec.js`
            },
            
            compiler: compiler.babel({
                presets: ['es2015']
            }),
            
            include: [/src/],
            
            exclude: [/node_modules/],
            
            dependencies: ['./tests/setup.js'],
            
            mocks: {
                [path.resolve('src/utils/transport.js')]: path.resolve('tests/mocks/transport.js')
            },
            
            plugins: []
        })
    ]
}
```


### Supporting multiple test runners
Now Test machine supports mocha and jasmine test runners, you can find them in `test-machine-plugins` package.
Ava on the way!
