const utils = require('../src/utils')

describe(`getValueString() tests`, () => {
    test(`should properly return scalar in value object`, () => {
        const value = utils.getValueString({ $gte: 21 })
        expect(value).toEqual(21)
    })

    test(`should properly return array in value object`, () => {
        const value = utils.getValueString({ $in: [21, 54, 34] })
        expect(value).toEqual(`(21, 54, 34)`)
    })
})

describe(`getIndividualWhereClause() tests`, () => {
    test(`should properly return when simple equal`, () => {
        const whereClause = utils.getIndividualWhereClause({ price: 10 })
        expect(whereClause).toEqual(`price = 10`)
    })

    test(`should properly return for less than`, () => {
        const whereClause = utils.getIndividualWhereClause({ quantity: { $lt: 20 } })
        expect(whereClause).toEqual(`quantity < 20`)
    })
})

describe(`getCompleteWhereClause() tests`, () => {
    test(`should properly return using OR`, () => {
        const whereClause = utils.getCompleteWhereClause({
            $or: [{ quantity: { $lt: 20 } }, { price: 10 }]
        })
        expect(whereClause).toEqual(`WHERE quantity < 20 OR price = 10`)
    })
})
