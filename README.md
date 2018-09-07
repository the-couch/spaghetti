# @friendsof/spaghetti
🍝 Tasty little compiler. Supports most modern JS syntax, and extracts CSS by default.

## Install
```bash
npm i @friendsof/spaghetti -g # or --save-dev for npm scripts
```

## Usage
```bash
spaghetti [options] <in> <outDir>
```

### Options
#### `-f, --filename`
Specify filename for both js and css output.
```bash
spaghetti src/index.js dist/ -f bundle
```

#### `-w, --watch`
Watch files for changes.
```bash
spaghetti src/index.js dist/ -w
```

#### `--jsx`
Specify a JSX pragma (default: `React.createElement`)
```bash
spaghetti src/index.js dist/ --jsx preact.h
```

#### `--config`
Specify a config file (default: `spaghetti.config.js`)
```bash
spaghetti src/index.js dist/ --config config.js
```

### Config
Config files support the same options, with the addition of `alias`.
```javascript
// spaghetti.config.js
module.exports = {
  in: 'src/index.js',
  outDir: 'dist',
  filename: 'index',
  alias: {
    components: 'src/components/'
  }
}
```

## License
MIT License © [Friends of Friends](https://thecouch.nyc)
