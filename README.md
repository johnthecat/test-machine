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

### Simple API

#### Install

`npm install test-machine-webpack test-machine-plugins --save-dev`

#### Usage

```javascript
//webpack
const path = require('path');
const {TestMachineWebpack} = require('test-machine-webpack');
const {compiler, engine} = require('test-machine-plugins');

module.exports = {
    plugins: [
        new TestMachineWebpack({
            testRoot: './tests',
            router(resource) {
                return `**/*${resource.name}.spec.js`
            },
            engine: engine.mocha({
                reporter: 'tap',
                timeout: 3000
            }),
            compiler: compiler.babel({
                presets: ['es2015']
            }),
            include: [/src/],
            exclude: [/node_modules/],
            dependencies: [
                './tests/setup.js'
            ],
            mocks: {
                [path.resolve('src/utils/transport.js')]: path.resolve('tests/mocks/transport.js')
            },
            plugins: []
        })
    ]
}
```
