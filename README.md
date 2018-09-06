# @friendsof/roll
"Zero config" compiler for JS & CSS.

## Usage
Install globally:
```bash
npm i @friendsof/roll -g

# build
roll src/index.js dist/index.js

# watch
roll src/index.js dist/index.js -w
```
Or per project:
```bash
npm i @friendsof/roll --save-dev

# build
./node_modules/.bin/roll src/index.js dist/index.js

# watch
./node_modules/.bin/roll src/index.js dist/index.js -w

# package.json
{
  "scripts": {
    "build": "roll src/index.js dist/index.js",
    "watch": "roll src/index.js dist/index.js -w",
  }
}
```

## License
MIT License © [Friends of Friends](https://thecouch.nyc)
