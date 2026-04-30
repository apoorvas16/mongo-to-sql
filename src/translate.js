const _eval = require('eval')
const utils = require('./utils')

/**
 * Translates a Mongo find query to an SQL query
 * @param {*} mongoQuery
 * @returns SQL query string
 */
const translate = mongoQuery => {
    const table = mongoQuery.split(`.`)[1]

    // Getting string representing Mongo query object
    const indexOfFirstLeftParen = mongoQuery.indexOf(`(`)
    const indexOfLastRightParen = mongoQuery.lastIndexOf(`)`)

    const queryObjectsString = mongoQuery.substring(
        indexOfFirstLeftParen + 1,
        indexOfLastRightParen
    )

    // Converting to array in case there multiple pieces
    const queryObjectsStrings = `[${queryObjectsString}]`

    // Using eval to convert into javascript object
    const queryObjects = _eval(`const x = ${queryObjectsStrings}; exports.x = x`).x

    const whereObject = queryObjects[0]
    const selectObject = queryObjects.length > 1 ? queryObjects[1] : undefined

    const whereClause =
    whereObject && Object.keys(whereObject).length > 0
        ? utils.getCompleteWhereClause(whereObject)
        : ''

    const sqlString = `SELECT ${utils.getColumns(
        selectObject
    )} FROM ${table} ${whereClause};`

    return sqlString
}

exports.translate = translate
