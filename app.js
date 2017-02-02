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
    inf_prix: 0
}


//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory

app.get( '/', function ( req, res ) {
    request( 'https://www.leboncoin.fr/ventes_immobilieres/1076257949.htm?ca=12_s', function ( error, response, body ) {
        if ( !error && response.statusCode == 200 ) {
            var $ = cheerio.load( body );
            {
                var price = $( 'span.value' );
                var pr = price.eq( 0 ).text().trim().split( '' );
                var pri = pr[0] + pr[1];

                //var surface =
                var type = $( 'span.value' )

                var hab = ( parseFloat( pr[0] * 1000 + parseFloat( pr[1] ) ) / parseFloat( surface ) )
                data = {
                    inf_prix: pri

                }
            }


            res.render( 'home', {
                prix: data.inf_prix
            });
        }
    })
});



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});