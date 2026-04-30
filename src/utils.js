const util = require('util')

/**
 * Returns column present in a Mongo column object
 * @param {*} columnObject
 * @returns String representing columns for SQL
 */
const getColumns = columnObject => {
    if (!columnObject) {
        return `*`
    }

    const columns = Object.keys(columnObject)
    const numColumns = columns.length
    let columnsString = ``

    for (let i = 0; i < numColumns; i++) {
        columnsString += columns[i]

        if (i < numColumns - 1) {
            columnsString += `, `
        }
    }

    return columnsString
}

/**
 * Given a Mongo object, returns the SQL operator and value
 * @param {} whereObject
 * @returns `{operator: string, value: string}`
 */
const getOperatorAndValueString = whereObject => {
    const valueObject = whereObject[Object.keys(whereObject)[0]]

    if (typeof valueObject !== 'object') {
        return { operator: `=`, value: getCompleteValueString(valueObject) }
    } else {
        const operatorString = Object.keys(valueObject)[0]

        switch (operatorString) {
            case '$lt':
                return { operator: `<`, value: getCompleteValueString(valueObject) }
            case '$lt':
                return {
                    operator: `<=`,
                    value: getCompleteValueString(valueObject)
                }
            case '$gt':
                return {
                    operator: `>`,
                    value: getCompleteValueString(valueObject)
                }
            case '$gte':
                return {
                    operator: `>=`,
                    value: getCompleteValueString(valueObject)
                }
            case '$ne':
                return {
                    operator: `!=`,
                    value: getCompleteValueString(valueObject)
                }
            case '$in':
                return {
                    operator: `in`,
                    value: getCompleteValueString(valueObject)
                }
            default:
                throw new Error(`Operator not recognized: ${util.inspect(whereObject)}`)
        }
    }
}

/**
 * Returns an appropriate value string based on the type of value requested
 * @param {} valueObject
 * @returns valueString (e.g. (12, 54, 75) | 54 | 'foo')
 */
const getCompleteValueString = valueObject => {
    let valueString = ``

    if (typeof valueObject === 'object') {
        const valueObjectObject = valueObject[Object.keys(valueObject)[0]]

        if (Array.isArray(valueObjectObject)) {
            valueString += `(`
            for (let i = 0; i < valueObjectObject.length; i++) {
                valueString += getIndividualValueString(valueObjectObject[i])

                if (i < valueObjectObject.length - 1) {
                    valueString += `, `
                }
            }
            valueString += `)`

            return valueString
        } else {
            valueString = valueObjectObject
        }
    } else {
        valueString = valueObject
    }

    return getIndividualValueString(valueString)
}

const getIndividualValueString = value => {
    if (typeof value === `number`) {
        return value
    } else {
        return `'${value}'`
    }
}

/**
 * Takes a compound Mongo where object and converts it into a complete SQL WHERE clause
 * @param {} whereObject
 * @returns SQL WHERE clause
 */
const getCompleteWhereClause = whereObject => {
    if (!whereObject) {
        return ``
    }

    const key = Object.keys(whereObject)[0]
    const whereClauses = []

    if (key === `$and` || key === `$or`) {
        const operator = key === `$and` ? `AND` : `OR`
        const clauses = whereObject[key]
        for (let i = 0; i < clauses.length; i++) {
            const clause = clauses[i]
            whereClauses.push(
                `${getIndividualWhereClause(clause)}${
                    i < clauses.length - 1 ? ` ${operator} ` : ``
                }`
            )
        }
    } else {
        whereClauses.push(getIndividualWhereClause(whereObject))
    }

    let finalWhereClause = `WHERE `

    for (const whereClause of whereClauses) {
        finalWhereClause += whereClause
    }

    return finalWhereClause
}

/**
 * Takes a simple Mongo where object and converts it into an invididual SQL WHERE clause
 * @param {*} whereObject
 * @returns Individual where clause
 */
const getIndividualWhereClause = whereObject => {
    const column = Object.keys(whereObject)[0]
    const { operator, value } = getOperatorAndValueString(whereObject)
    return `${column} ${operator} ${value}`
}

exports.getColumns = getColumns
exports.getIndividualWhereClause = getIndividualWhereClause
exports.getValueString = getCompleteValueString
exports.getCompleteWhereClause = getCompleteWhereClause
