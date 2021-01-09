const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {faunaFetch} = require('../utils/fauna')


exports.handler  = async (event, context) => {
    const {user} = context.clientContext;

    console.log(user);

    const query = `
    query(netlifyID : ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID ){
          stripeID
          netlifyID
        }
        
      }`;

      const variables = { netlifyID : user.sub}; 

      const result = await faunaFetch({query, variables});

      const stripeID = result.data.getUserbyNetlifyId.stripeID;

      console.log(stripeID);

    return {
        statusCode : 200,
        body : JSON.stringify(result),
    }
}