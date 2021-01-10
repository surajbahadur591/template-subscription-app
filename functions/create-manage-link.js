const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const fetch = require('node-fetch');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {faunaFetch} = require('../utils/fauna')


exports.handler  = async (event, context) => {
    const {user} = context.clientContext;

    console.log(user);
    

    
    // const  netlifyID = user.sub; 

    // const response = await fetch("https://graphql.fauna.com/graphql", {
    //     method : 'POST',
    //     headers: {
    //         Authorization: `Bearer ${process.env.FAUNA_SERVER_KEY}`,
    //     },
    //     body : JSON.stringify({
    //         query: `
    //         query($netlifyID : ID!) {
    //             getUserByNetlifyID(netlifyID: $netlifyID ){
    //               stripeID
    //               netlifyID
    //             }
                
    //           }
    //         `,  
    //         variables : {
    //             netlifyID,
                
    //         }
    //     })
    // });

   


    const query = `
    query($netlifyID : ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID ){
          stripeID
          netlifyID
        }
        
      }`;

      const variables = { netlifyID : user.sub}; 



      const result = await faunaFetch({query, variables});

      console.log(result);

      const stripeID = result.data.getUserByNetlifyID.stripeID;
      console.log(stripeID);

      const session = await stripe.billingPortal.sessions.create({
        customer: stripeID,
        return_url: 'https://www.google.com',

       });

       console.log(session);
       console.log(session.url)
  

    return {
        statusCode : 301,
        body : JSON.stringify(session.url),
    } 
}