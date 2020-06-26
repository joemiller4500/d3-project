var types = ['micro', 'regional', 'brewpub', 'large', 'planning', 'bar', 'contract', 'proprietor']
var type = 'micro'
// var url = `https://api.openbrewerydb.org/breweries?by_type=${type}&page=${page}`

var breweries = [];

function typesFunction(type) {
    for (var i=1; i<200; i++){
        var url = `https://api.openbrewerydb.org/breweries?by_type=${type}&page=1`
        d3.json(url).then(function(data) {
            breweries.push(data);
            console.log(breweries)

        });
    }
}

types.forEach(typesFunction);

    
