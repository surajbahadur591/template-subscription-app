exports.handler = async(event, context) => {
    const {user} = context.clientContext;

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