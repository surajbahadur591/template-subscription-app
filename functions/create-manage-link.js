const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const fetch = require('node-fetch');
const {faunaFetch} = require('../utils/fauna')


//this is handler for creating stripe billing portal link used for accepting payment
exports.handler  = async (event, context) => {
    const {user} = context.clientContext;

    console.log(user);  

    // query to be send to fauna.com
    const query = `
    query($netlifyID : ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID ){
          stripeID
          netlifyID
        }
        
      }`;

      // set of variables to be send to fauna.com
      const variables = { netlifyID : user.sub}; 

      // fetching the response from fauna 
      // faunafetch is function for easy query/mutation
      const result = await faunaFetch({query, variables});

      console.log(result);

      const stripeID = result.data.getUserByNetlifyID.stripeID;
      console.log(stripeID);

      const session = await stripe.billingPortal.sessions.create({
        customer: stripeID,
        return_url: 'https://template-subscription-app.netlify.app/',

       });

       console.log(session);
       console.log(session.url)
  

    return {
        statusCode : 301,
        body : JSON.stringify(session.url),
    } 
}