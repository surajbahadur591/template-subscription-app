// a handler to display premium content

exports.handler = async(event, context) => {
    const {user} = context.clientContext;

    // if the user has matching plan
    // premium -testing is the name of the plan
    if(!user || !user.app_metadata.roles.includes('Premium-testing')){
        return {
            statusCode: 402,
            body : "Unlock Premium Content by Upgrading!!!"
        }
    }

    return {
        statusCode: 200,
        body : "Finally!! you have premium content"
    }


}