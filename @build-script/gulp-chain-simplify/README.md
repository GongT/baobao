# gulp-chain-simplify

Change:

```
 └─┬ test
   └─┬ <series>
     ├── a1
     ├─┬ <series>
     │ ├── b1
     │ └── b2
     └── a2
```

Into:

```
 └─┬ test
   └─┬ <series>
     ├── a1
     ├── b1
     ├── b2
     └── a2
```
