# MongoDB to SQL Translator

Author: Karim Varela

## To run interactively

`yarn start`

## To run unit tests

`yarn test`

## Methodology

The syntax to express queries in Mongo is in JSON notation so the first thing I do is convert the JSON string to a javascript object so I can work with it.

Then, I separate the Mongo query into its 2 main parts: the where clause and and the select clause. Based on the content of these objects, I build out the SQL query.

## Architecture

-   `src/index`: Entry point, handles user input
-   `src/translate`: Parses input and creates Mongo query objects
-   `src/utils`: Helper functions for parsing the Mongo query objects
-   `tests`: A small suite of unit tests
