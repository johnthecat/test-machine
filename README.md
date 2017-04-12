# Webpack test runner

## API

```javascript
const TestRunner = require('webpack-test-runner-plugin');

module.exports = {
    plugins: [
        new TestRunner(/* options */)
    ]
}
```

### Options

#### `testRoot: string`

#### `engine: (tests: Array<string>) => Promise<void>`

#### `exclude: Array<RegExp>`

#### `include: Array<RegExp>`

#### `router: (res: path.ParsedPath) => string | Array<string>`

#### `compiler: (source: string, filename: string) => string`

#### `dependencies: Array<string>`

#### `mocks: {[absolutePath: string]: string}`






