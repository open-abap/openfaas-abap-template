CLASS zcl_handler DEFINITION PUBLIC.

  PUBLIC SECTION.
    TYPES: BEGIN OF ty_header,
             field TYPE string,
             value TYPE string,
           END OF ty_header.

    TYPES ty_headers TYPE STANDARD TABLE OF ty_header WITH DEFAULT KEY.

    TYPES: BEGIN OF ty_http,
             headers TYPE ty_headers,
             body    TYPE string,
           END OF ty_http.

    METHODS:
      run
        IMPORTING
          method      TYPE string OPTIONAL
          path        TYPE string OPTIONAL
          query       TYPE string OPTIONAL
          " request     TYPE ty_http OPTIONAL
          body        TYPE string OPTIONAL "TODO: Remove in favor of request once structures are supported        RETURNING
          VALUE(response) TYPE ty_http
        RAISING
          cx_static_check.

ENDCLASS.

CLASS zcl_handler IMPLEMENTATION.

  METHOD run.
* Put your ABAP code here.
* In the end, move the (stringified) result to the body of the response

* response-body = my-result


  ENDMETHOD.

ENDCLASS.
