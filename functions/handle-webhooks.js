const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {faunaFetch} = require('../utils/fauna')
const fetch = require('node-fetch')


// webhook triggred when customer update their subscription
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
        console.log(JSON.stringify(plan))

        // const role = `sub: ${plan.split('-')[0].toLowerCase()}`;



        // query to be send to fauna.com
        const query = `
              query($stripeID : ID!) {
                  getUserByStripeID(stripeID: $stripeID ){
                    netlifyID
                  }
                  
                }`;

      const variables = { stripeID}; 

      const result = await faunaFetch({query, variables});

      console.log(result);
      const netlifyID = result.data.getUserByStripeID.netlifyID;

      
      // updating the plan / subscription of current user i.e premium or free
      const {identity} = context.clientContext;
      const response = await fetch(`${identity.url}/admin/users/${netlifyID}`, {
          method: 'PUT',
          headers: {
              Authorization: `Bearer ${identity.token}`
          },
          body: JSON.stringify({
              app_metadata: {
                  roles: [plan]
              }
          })
      }).then(res => res.json())
      .catch(err => console.log(err))

      console.log(response)
      }
      
      return {
        statusCode: 200,
        body: 'ok',
      };
    } catch (err) {
      console.log(`Stripe webhook failed with ${err}`);
  
      return {
        statusCode: 400,
        body: `Webhook Error: ${err.message}`,
      };
    }
  };