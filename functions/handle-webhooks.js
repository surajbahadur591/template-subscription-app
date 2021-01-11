const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {faunaFetch} = require('../utils/fauna')
const {fetch} = require('node-fetch')

exports.handler = async ({ body, headers }, context) => {
    try {
      const stripeEvent = stripe.webhooks.constructEvent(
        body,
        headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
  
      if (stripeEvent.type === 'customer.subscription.updated') {
        const subscription = stripeEvent.data.object;
        console.log(JSON.stringify(subscription, null, 2))

        const stripeID = subscription.customer;
        const plan = subscription.items.data[0].plan.nickname;

        const role = `sub: ${plan.split('-')[0].tolowercase()}`;


        const query = `
    query($stripeID : ID!) {
        getUserByNetlifyID(stripeID: $stripeID ){
          netlifyID
        }
        
      }`;

      const variables = { stripeID}; 



      const result = await faunaFetch({query, variables});
      const netlifyID = result.data.getUserByStripeID.netlifyID;


      const {identity} = context.clientContext;
      const response = await fetch(`${identity.url}/admin/users/${netlifyID}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${identity.token}`
          },
          body: JSON.stringify({
              app_metadata: {
                  roles: [role]
              }
          })
      }).then(res => res.json())
      .catch(err => console.log(err))

      console.log(response)
      }
  
      return {
        statusCode: 200,
        body: JSON.stringify(subscription),
      };
    } catch (err) {
      console.log(`Stripe webhook failed with ${err}`);
  
      return {
        statusCode: 400,
        body: `Webhook Error: ${err.message}`,
      };
    }
  };