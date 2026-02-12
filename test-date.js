const { formatDate } = require('./lib/cv/formatters');

const cases = [
    "2023-04",
    "2023-04 ",
    " 2023-04",
    "2023-04-01",
    "2023/04",
    "2023-13",
    "2016-10",
    "Présent",
    "Present",
    undefined,
    null
];

console.log("--- START TEST ---");
cases.forEach(c => {
    try {
        console.log(`'${c}' -> '${formatDate(c)}'`);
    } catch (e) {
        console.error(`'${c}' -> ERROR: ${e.message}`);
    }
});
console.log("--- END TEST ---");
