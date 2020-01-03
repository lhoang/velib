export async function getData(source){
    const operations = await fetch(source)
        .then(response => response.json())
        .then(json => json.walletOperations);

    return operations.map(clean);
}


const clean = (operation) => ({
    date: new Date(operation.startDate),
    duration: (operation.endDate - operation.startDate) / 1000,
    distance: operation.parameter3.DISTANCE,
    co2: operation.parameter3.SAVED_CARBON_DIOXIDE,
});
