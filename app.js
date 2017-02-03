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
    adresse: "",
    prixSurfaceHabitable: 0,
}


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
//var url = "https://www.leboncoin.fr/ventes_immobilieres/1074660822.htm?ca=12_s"

app.get( '/', function ( req, res ) {

    var url = req.query.urlLBC
    if ( url ) {
        request( url, function ( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
                var $ = cheerio.load( body );
                {
                    //le trim enlève tous les espaces au début et à la fin

                    var prixx = $( 'h2.item_price.clearfix span.value ' ).text().trim().split( ' ' );
                    data.prix = prixx[0] + prixx[1];

                    var typee = $( $( 'h2.clearfix span.value' ).get( 3 ) ).text()
                    data.type = typee

                    var piecess = $( $( 'h2.clearfix span.value' ).get( 4 ) ).text()
                    data.pieces = piecess

                    var surfacee = $( $( 'h2.clearfix span.value' ).get( 5 ) ).text()
                    data.surface = surfacee

                    //var adresse = $( $( 'h2.clearfix span.value' ).get( 3 ) ).text()
                    data.adresse = $( $( 'h2.clearfix span.value' ).get( 1 ) ).text()


                    //data.cp = $( $( 'h2.clearfix span.value' ).get( 0 ) ).text()

                    data.prixAuMetreCarre = parseInt( data.prix ) / parseInt( data.surface )
                }
                res.render( 'home', {
                    prix: data.prix,
                    type: data.type,
                    pieces: data.pieces,
                    surface: data.surface,
                    adresse: data.adresse,
                    prixAuMetreCarre: data.prixAuMetreCarre,
                });
            }
        })
    }
    else {
        res.render( 'home', {
            prix: data.prix,
            type: data.type,
            pieces: data.pieces,
            surface: data.surface,
            adresse: data.adresse,
            prixAuMetreCarre: data.prixAuMetreCarre,
        });
    }
});



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});