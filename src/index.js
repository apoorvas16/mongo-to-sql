const program = require('commander')
const translate = require('./translate')

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

const query = () => {
    readline.question(`Enter mongo query: `, mongoQuery => {
        const sqlString = translate.translate(mongoQuery)

        console.log(sqlString)
        console.log(`\n`)

        query()
    })
}

program
    .action(() => {
        query()
    })
    .parse(process.argv)
