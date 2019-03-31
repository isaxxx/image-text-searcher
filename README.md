# image-text-searcher

Find out if the text extracted from the image matches any text.

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

## Usage

### Step1

```bash
$ npm install
```

### Step2

Put images in src directory.

### Step3

Output the text files.

```bash
$ npm run start
```

or

```bash
$ node index.js
```

### Step4

Please edit search.txt with the words you want to search.

### Step5

Copy files not matching search word to dest directory.

```bash
$ npm run search
```

To specify the number of matches.

```bash
$ npm run search -- 2
```
