// will have to add additional function in notionController.js for
// insertCoduckRows.
//
// to only insert when user has logged into their notion, otherwise
// just send back tele text
// reason being is that notion isnt really the only way users will be able
// to store their tasks, the upcoming mobile app will store tasks
// via localstorage, so users still have a choice of saving locally
// or to notion for ease of access.

// to setup user's chosen table for tasks insertion
// should launch after doing /notion
// will prompt user for database id
// this will only work, and should only work when user has already logged into
// notion. 

// will add a "choose table" command once i settle this backbone
bot.command("setup", (ctx) => {
  try {
    const userID = ctx.from.id;
    

  } catch (err) {

  }


});

// to make user login into their notion account so they can do /setup
// redirects user to login notion, to make user login, set token
// into supabase.
//
// supabase will contain tele user id, notion user token, and database id
// callback will be t.me after logon
bot.command("notion", (ctx) => {
  try {
    const userID = ctx.from.id;
    

  } catch (err) {

  }


});
