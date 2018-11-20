# @friendsof/spaghetti
🍝 Tasty little compiler util. Supports most modern JS syntax, as well as compiles
and extracts CSS (or SCSS) by default.

## Install
```bash
npm i @friendsof/spaghetti -g # or --save-dev for npm scripts
```

## Usage
```bash
spaghetti [options] <in> <outDir>
```

### Options
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

#### `--map`
Any source map value supported by webpack (default: `source-map`)
```bash
spaghetti src/index.js dist/ --map cheap-module-source-map
```

#### `--sass`
Use sass instead of postcss
```bash
spaghetti src/index.js dist/ --sass
```

#### `--config`
Specify a config file (default: `spaghetti.config.js`)
```bash
spaghetti src/index.js dist/ --config config.js
```

### Config
Config files support the same options as above, along with a couple additions.
```javascript
// spaghetti.config.js
module.exports = {
  in: 'src/index.js',
  outDir: 'dist',
  jsx: 'h',
  alias: {
    components: 'src/components/'
  },
  banner: '/** Hello there */'
}
```

## License
MIT License © [Friends of Friends](https://thecouch.nyc)
