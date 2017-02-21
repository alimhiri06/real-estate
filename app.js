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

/*
var data = {
    prix: 0,
    type: "",
    pieces: "",
    surface: 0,
    adresse: "",
    prixSurfaceHabitable: 0,
}
*/

//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
//var url = "https://www.leboncoin.fr/ventes_immobilieres/1074660822.htm?ca=12_s"

app.get( '/', function ( req, res ) {

    var url = req.query.urlLBC
    if ( url ) {
        request( url, function ( error, response, body ) {
            if ( !error && response.statusCode == 200 ) {
                var $ = cheerio.load( body );
                {
                    /*le trim enlève tous les espaces au début et à la fin*/
                    var prixx = $( 'h2.item_price.clearfix span.value ' ).text().trim().split( ' ' );

                    /*parseInt pour price et surface pour faire le rapport des deux
                    et obtenir le prixAuMetreCarre sinon price et surface sont considérés
                    comme deux string */
                    var price = parseInt( prixx[0] + prixx[1] );

                    /*Dans les annonces, les frais d'agences peuvent être inclus ou non.
                    Ce if/else me permet de distinguer ce cas là.*/
                    if ( $( $( 'h2.clearfix span.value' ).get( 2 ) ).text() == 'Oui' ) {
                        var type = $( $( 'h2.clearfix span.value' ).get( 3 ) ).text()
                        var pieces = $( $( 'h2.clearfix span.value' ).get( 4 ) ).text()
                        var surface = parseInt( $( $( 'h2.clearfix span.value' ).get( 5 ) ).text() )
                        var classeEnergie = $( $( 'h2.clearfix span.value' ).get( 8 ) ).text()
                    }
                    else {
                        var type = $( $( 'h2.clearfix span.value' ).get( 2 ) ).text()
                        var pieces = $( $( 'h2.clearfix span.value' ).get( 3 ) ).text()
                        var surface = parseInt( $( $( 'h2.clearfix span.value' ).get( 4 ) ).text() )
                        var classeEnergie = $( $( 'h2.clearfix span.value' ).get( 6 ) ).text()
                    }

                    /*Je choisi ici d'afficher l'adresse complètement sans distinguer ville et code postal
                    car parfois les villes peuvent être composées, d'où ce choix*/
                    var adresse = $( $( 'h2.clearfix span.value' ).get( 1 ) ).text()
                    var ville = adresse.split( ' ' )[0];
                    var codePostal = adresse.split( ' ' )[1];

                    /*Prix au m² = Ratio du price sur la surface prélablement convertis en int*/
                    var prixAuMetreCarre = price / surface;

                }


                request( 'http://www.meilleursagents.com/prix-immobilier/' + ville.toLowerCase() + '-' + codePostal, function ( error, response, body ) {
                    if ( !error && response.statusCode == 200 ) {

                        var dollar = cheerio.load( body );

                        /*On charge la colonne qui contient les prix moyen du m² */
                        var prixco = dollar( 'div.small-4.medium-2.columns.prices-summary__cell--median' );

                        /*Distinction de cas : si c'est un Appartement on prend la première valeur de la colonne,
                        et si c'est une Maison on prend la deuxième*/
                        if ( type == "Appartement" ) {

                            var prixComparateur = prixco.eq( 0 ).html().split( '&#xA0;' );

                            /*parseInt pour pouvoir ensuite comparer les 2 variables prixComparateur
                            et prixAuMetreCarre*/
                            var priceComparateur = parseInt( prixComparateur[0] + prixComparateur[1] );

                            if ( prixAuMetreCarre <= priceComparateur ) {
                                var conclusion = "bonne";
                            }
                            else {
                                var conclusion = "mauvaise";
                            }

                        }

                        if ( type == "Maison" ) {

                            var prixComparateur = prixco.eq( 1 ).html().split( '&#xA0;' );
                            var priceComparateur = parseInt( prixComparateur[0] + prixComparateur[1] );

                            if ( prixAuMetreCarre <= priceComparateur ) {
                                var conclusion = "bonne";
                            }
                            else {
                                var conclusion = "mauvaise";
                            }

                        }

                        res.render( 'home', {
                            prix: price,
                            type: type,
                            pieces: pieces,
                            surface: surface,
                            adresse: adresse,
                            prixAuMetreCarre: prixAuMetreCarre,
                            classeEnergie: classeEnergie,
                            prixComparateur: priceComparateur,
                            conclusion: conclusion,
                        });


                    }

                })
            }


        })
    }

    else {
        res.render( 'home', {
            prix: 0,
            type: "",
            pieces: 0,
            surface: 0,
            adresse: "",
            prixAuMetreCarre: 0,
            classeEnergie: "",
            prixComparateur: 0,
            conclusion: "",
        });
    }

});



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});