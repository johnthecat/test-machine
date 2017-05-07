<p align="center">
<img width="400px" src="https://cloud.githubusercontent.com/assets/5618341/25568246/4fcfed3e-2e07-11e7-992b-e9a61abfd6e2.png"/>
</p>
<hr/>

<p align="center">
Quick links:
<br/>
<a href="https://github.com/johnthecat/test-machine/tree/master/packages/test-machine-core">Core</a>
|
<a href="https://github.com/johnthecat/test-machine/tree/master/packages/test-machine-webpack">Webpack plugin</a>
|
<a href="https://github.com/johnthecat/test-machine/tree/master/packages/test-machine-plugins">Engines and compilers</a>
<hr/>
</p>

[![NPM Version](https://img.shields.io/npm/v/test-machine-core.svg?style=flat)](https://www.npmjs.com/package/test-machine-core)
[![Coveralls](https://img.shields.io/coveralls/johnthecat/test-machine/master.svg?style=flat)](https://coveralls.io/github/johnthecat/test-machine)
[![Travis status](https://img.shields.io/travis/johnthecat/test-machine/master.svg?style=flat)](https://travis-ci.org/johnthecat/test-machine)

Test machine is the easiest way to test your bundled code.

Features:
* Simple API;
* Supporting multiple test runners (Mocha, Jasmine);
* Fast test running right inside your build process;
* Incremental testing;
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
const { TestMachineWebpack } = require('test-machine-webpack');
const { compiler, engine } = require('test-machine-plugins');

module.exports = {
    plugins: [
        new TestMachineWebpack({
        
            // Required
            
            testRoots: [
              './tests'
            ],
            
            engine: engine.mocha({
                reporter: 'tap',
                timeout: 3000
            }),
            
            // Not required
            
            router(resource) {
                return [
                    `**/*${resource.name}.spec.js`,
                    `**/*${resource.name}.test.js`
                ];
            },
            
            compilers: [
              compiler.babel({
                presets: ['es2015']
              })
            ],
            
            include: [ /src/ ],
            
            exclude: [ /node_modules/ ],
            
            dependencies: [ './tests/setup.js'  ],
            
            mocks: {
                [ path.resolve('src/utils/transport.js') ]: path.resolve('tests/mocks/transport.js')
            },
            
            plugins: []
        })
    ]
}
```


### Supporting multiple test runners
Now Test machine supports mocha and jasmine test runners, you can find them in `test-machine-plugins` package.
