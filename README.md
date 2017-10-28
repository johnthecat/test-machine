<p align="center">
  <a href="https://github.com/johnthecat/test-machine">
    <img width="400px" src="https://cloud.githubusercontent.com/assets/5618341/25568246/4fcfed3e-2e07-11e7-992b-e9a61abfd6e2.png"/>
  </a>
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

[![license](https://img.shields.io/github/license/johnthecat/test-machine.svg)](https://github.com/johnthecat/test-machine/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/test-machine-core.svg?style=flat)](https://www.npmjs.com/package/test-machine-core)
[![Coveralls](https://img.shields.io/coveralls/johnthecat/test-machine/master.svg?style=flat)](https://coveralls.io/github/johnthecat/test-machine)
[![Travis status](https://img.shields.io/travis/johnthecat/test-machine/master.svg?style=flat)](https://travis-ci.org/johnthecat/test-machine)

Test machine is the easiest way to test your bundled code.

Features:
* Simple API;
* Supporting multiple test runners (Mocha, Jasmine);
* Transpiling modules and tests by included or external compilers;
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

testRoots: Array<string>,
exclude: Array<RegExp>,
include: Array<RegExp>,
router: Router,
engine: Engine,
compilers: Array<CompilerPlugin>,
plugins: Array<IPlugin>,
dependencies: Array<string>,
mocks: IMocks

### API


#### `testRoots` - `Array<string>`
Must include all static (not glob) paths, where your tests exists.

```javascript
testRoots: [
    './tests', // from cwd
    path.resolve('__test__') // absolute
]
```


#### `router` - `(path: path.ParsedPath) => string | Array<string>`
Routing function, which has 1 argument - parsed path to any bundled module, 
must return glob or array of globs.

How it works: it takes absolute path for each founded modules and passes it into router.
Using this ability, you can make you test running _incremental_, 
that means test runner will get only tests for modules, 
that really changed.

```javascript
// incremental test running
// resource: path.parse("path/to/my/bundled/module/my-module.js")
// simple link, in this case will return "**/my-module.spec.js"
router: (resource) => `**/${resource.name}.spec.js`
```

```javascript
// simple test running
// will run all test, that was found in testRoots
router: (resource) => `**/*.spec.js`
```

#### `engine` - `CompilerPlugin`
Your test runner. Currently supported:
* [Mocha](https://mochajs.org/)
* [Jasmine](https://jasmine.github.io/)

```javascript
engine: engine.mocha({
    reporter: 'tap',
    timeout: 5000
})
```


#### `include` - `Array<RegExp>`
Includes only modules, that passes regExp testing.

```javascript
include: [
    /components/
]
```

#### `exclude` - `Array<RegExp>`
Excludes modules from testing.

```javascript
exclude: [
    /node_modules/
]
```


