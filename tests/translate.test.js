const translate = require('../src/translate')

describe(`Query tests`, () => {
    test(`db.user.find({name: 'julio'});`, () => {
        const sqlString = translate.translate(`db.user.find({name: 'julio'});`)
        expect(sqlString).toEqual(`SELECT * FROM user WHERE name = 'julio';`)
    })

    test(`db.user.find({_id: 23113},{name: 1, age: 1});`, () => {
        const sqlString = translate.translate(`db.user.find({_id: 23113},{name: 1, age: 1});`)
        expect(sqlString).toEqual(`SELECT name, age FROM user WHERE _id = 23113;`)
    })

    test(`db.user.find({age: {$gte: 21}},{name: 1, _id: 1});`, () => {
        const sqlString = translate.translate(`db.user.find({age: {$gte: 21}},{name: 1, _id: 1});`)
        expect(sqlString).toEqual(`SELECT name, _id FROM user WHERE age >= 21;`)
    })

    test(`db.user.find({age: {$in: [21, 35, 56]}},{name: 1, _id: 1});`, () => {
        const sqlString = translate.translate(
            `db.user.find({age: {$in: [21, 35, 56]}},{name: 1, _id: 1});`
        )
        expect(sqlString).toEqual(`SELECT name, _id FROM user WHERE age in (21, 35, 56);`)
    })

    test(`db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )`, () => {
        const sqlString = translate.translate(
            `db.inventory.find( { $or: [ { quantity: { $lt: 20 } }, { price: 10 } ] } )`
        )
        expect(sqlString).toEqual(`SELECT * FROM inventory WHERE quantity < 20 OR price = 10;`)
    })

    test(`db.inventory.find( { $and: [ { quantity: { $lt: 20 } }, { type: 'foo' } ] } )`, () => {
        const sqlString = translate.translate(
            `db.inventory.find( { $and: [ { quantity: { $lt: 20 } }, { type: 'foo' } ] } )`
        )
        expect(sqlString).toEqual(`SELECT * FROM inventory WHERE quantity < 20 AND type = 'foo';`)
    })
})
