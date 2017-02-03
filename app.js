//importing modules
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );

//creating a new express server
var app = express();

//get, use... sont la liste des méthodes du package express
//le package request (node request sur google) permet dappeler une url de leboncoin
//cheerio permet de parser une page html



//setting EJS as the templating engine
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

var data = {
    prix: 0,
    type: "",
    pieces: "",
    surface: 0,
    ville: "",
    cp: "",
    prixSurfaceHabitable: 0,
}


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
var url = "https://www.leboncoin.fr/ventes_immobilieres/1074660822.htm?ca=12_s"

app.get( '/', function ( req, res ) {
    request( url, function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( body );
            {
                var prixx = $( 'span.value' );
                var prix = prixx.eq( 0 ).text().split( '' );

                data.price = prix[0];

                var typee = $( 'span.value' )
                data.type = typee.eq( 2 ).text()

                var piecess = $( 'span.value' )
                data.pieces = piecess.eq( 3 ).text()

                var surfacee = $( 'span.value' )
                data.surface = surfacee.eq( 4 ).text()

                var adresse = $( 'span.value[itemprop=address]' ).text()
                data.ville = adresse.split( '' )[0]
                data.cp = adresse.split( '' )[1]

                data.prixAuMetreCarre = ( prix[0] * 1000 + prix[1] ) / data.surface


            }

        }
    })
    res.render( 'home', {
        prix: data.price,
        type: data.type,
        pieces: data.pieces,
        surface: data.surface,
        ville: data.ville,
        cp: data.cp,
        prixAuMetreCarre: data.prixAuMetreCarre,
    });
});



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});