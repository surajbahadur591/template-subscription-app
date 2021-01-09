const fetch = require('node-fetch');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.handler = async (event) => {
    const {user} = JSON.parse(event.body);
    console.log(JSON.stringify(user, null, 2));

    const netlifyID = user.id;


    const customer = await stripe.customers.create({
        email : user.email
    })

    await stripe.subscriptions.create({
        customer : customer.id,
        items: [{plan : 'price_1I7ctvLcem5Y2qDMgRD1vd5X'}]
    })
    const stripeID = customer.id;


    const response = await fetch("https://graphql.fauna.com/graphql", {
        method : 'POST',
        headers: {
            Authorization: `Bearer ${process.env.FAUNA_SERVER_KEY}`,
        },
        body : JSON.stringify({
            query: `
            mutation($netlifyID : ID! $stripeID: ID!) {
                createUser(data: {netlifyID: $netlifyID, stripeID :$stripeID}){
                  netlifyID
                  stripeID
                }
              }
            `,  
            variables : {
                netlifyID,
                stripeID,
            }
        })
    });


    return {
        // every serverless function has to return status code and body
        statusCode : 200,
        body : JSON.stringify({app_metadata : { roles: ['free-subscription']}}),
    
}
}