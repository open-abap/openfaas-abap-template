# OpenFaaS template for ABAP

You are about to venture the unknown depths of outer space:
Go, where no ABAP code has ever gone before: Into the realms where there's no Netweaver.

Howver, be aware: st this statge, a netweaver-less ABAP is only a proof of concept:
*Hardly any language features are supported - yet.*
Feel free to experiment and contribute though!

## How it works

Under the hood, this template scaffolds a transpilation of your ABAP source to Javascript.
It will also execute only this Javascript.

## How to get started

- Get an OpenFaaS installation
- Add this template
- Implement `function/handler.abap`

## Samples

`handler.js` for calculating Fibonacci numbers
```abap
FUNCTION HANDLER.
*"----------------------------------------------------------------------
**"  IMPORTING
*"     REFERENCE(INPUT) TYPE ANY
*"  EXPORTING
*"     REFERENCE(OUTPUT) TYPE STRING
*"----------------------------------------------------------------------
    DATA: lv_old     TYPE i VALUE 1,
          lv_current TYPE i VALUE 2,
          lv_next    TYPE i.

    DO input TIMES.
      lv_next = lv_old + lv_current.
      lv_old = lv_current.
      lv_current = lv_next.
    ENDDO.

    output = lv_current.

ENDFUNCTION.
```

## Testing

Unit tests can be implemented against the compiled JS files using your favorite JS testing framework. They are run at build time via "npm run", edit package.json to specify how you want to execute them.
