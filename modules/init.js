import constants from "./constants.js";
import UserFrame from "./apps/UserFrame.js";

let user;
let userFrame;

Hooks.once("ready", () => {
    console.log(ui);
    console.log(game);
    console.log(game.userId);
    console.log(game.users.get(game.userId));
    user = game.users.get(game.userId);
    userFrame = new UserFrame();
    userFrame.init(user);
  
    Hooks.callAll(`${constants.moduleName}:afterReady`);

    Handlebars.registerHelper('hasSpellSlot', function(ss, num, options) {
        try{
            if(ss){
                if(ss['ss' + num]){
                    return options.inverse(this);
                }
            }
        } catch {}
        
        return options.fn(this);
    })
  });

  Hooks.on("controlToken", (token, isControlled) => {
    if (!ui.userFrames?.rendered) return;
    console.log(user);
    console.log(token);
    if (!user.isGM) return;
    var actor = token.actor;
    userFrame.loadCharacter(actor);
    userFrame.updateUIHP(actor);
    userFrame.updateUIXP(actor);
    userFrame.updateUIImage(actor);
    userFrame.updateUISpellSlots(actor);
    userFrame.updateUIAC(actor);
    userFrame.updateUIResources(actor);
  });
  

  Hooks.on("updateActor", (actor, data, options, userId) => {
    if (!ui.userFrames?.rendered) return;
  
    userFrame.updateUIHP(actor);
    userFrame.updateUIXP(actor);
    userFrame.updateUIImage(actor);
    userFrame.updateUISpellSlots(actor);
    userFrame.updateUIAC(actor);
    userFrame.updateUIResources(actor);
  });

  $(document).on('click', '#player-torch', (e) => {
    userFrame.torchClick();
  });