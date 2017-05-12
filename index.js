// vers 1.0.0

const format = require('./format.js');

const BossId = [781, 3000]; // Lakan NM

//MessageId: BossAction
const BossMessages = {
	9781043: 1192035708,	// Lakan has noticed you.
	9781044: 1192037407,	// Lakan is trying to take you on one at a time.
	9781045: 1192035605		// Lakan intends to kill all of you at once.
};

const BossActions = {
	1192035448: {msg: 'Get out'},	// Begone orange
	1192035449: {msg: 'Get in'},	// Begone purple
	1192035705: {msg: 'Dodge + plague/regress'}, // Shield
	
	1192035708: {msg: 'Debuff (closest)', 		next: 1192037407}, // Debuff
	1192037407: {msg: 'Spread', 				next: 1192035605}, // Spread aka Circles
	1192035605: {msg: 'Gather + cleanse', 		next: 1192035708}, // Gather
	
	1192035709: {msg: 'Debuff (furthest)', 		next: 1192035606}, // Debuff
	1192037409: {msg: 'Gather', 				next: 1192035709}, // Spread aka Circles
	1192035606: {msg: 'Gather + no cleanse', 	next: 1192037409}, // Gather
};

const InversedAction = {
	1192035708: 1192035709,
	1192037407: 1192037409,
	1192035605: 1192035605
};

const ShieldWarningTrigger = 0.35; //boss hp%
const ShieldWarningMessage = 'Ring soon, get ready to dodge';

module.exports = function VSNMLakanGuide(dispatch) {
	
	let enabled = true,
	sendToParty = false,
	playerName,
	boss,
	shieldWarned,
	showNextMechanicMessage = true,
	timerNextMechanic, 
	lastMechanicAction;
		
    const chatHook = event => {		
		let command = format.stripTags(event.message).split(' ');
		
		if (['!vsnm-lakan'].includes(command[0].toLowerCase())) {
			toggleModule();
			return false;
		} else if (['!vsnm-lakan.party'].includes(command[0].toLowerCase())) {
			toggleSentMessages();
			return false;
		}
	}
	dispatch.hook('C_CHAT', 1, chatHook)	
	dispatch.hook('C_WHISPER', 1, chatHook)
  	
	// slash support
	try {
		const Slash = require('slash')
		const slash = new Slash(dispatch)
		slash.on('vsnm-lakan', args => toggleModule())
		slash.on('vsnm-lakan.party', args => toggleSentMessages())
	} catch (e) {
		// do nothing because slash is optional
	}
			
	function toggleModule() {
		enabled = !enabled;
		systemMessage((enabled ? 'enabled' : 'disabled'));
	}

	function toggleSentMessages() {
		sendToParty = !sendToParty;
		systemMessage((sendToParty ? 'Only you will see messages' : 'Messages will be sent to the party'));
	}	
	
	dispatch.hook('S_DUNGEON_EVENT_MESSAGE', 1, (event) => {	
		if (!enabled || !boss) return;
		
		let msgId = parseInt(event.message.replace('@dungeon:', ''));
		if (BossMessages[msgId]) {
			sendMessage('Next: ' + BossActions[BossMessages[msgId]].msg);
		}
	})
	
	function bossHealth() {
		return (boss.curHp / boss.maxHp);
	}
	
	dispatch.hook('S_BOSS_GAGE_INFO', 2, (event) => {
		if (!enabled) return;
		
		if (event.huntingZoneId === BossId[0] && event.templateId === BossId[1]) {
			boss = event;
		}
		
		if (boss) {
			let bossHp = bossHealth();
			if (bossHp > ShieldWarningTrigger) {
				shieldWarned = false;
			} else if (bossHp <= ShieldWarningTrigger && !shieldWarned) {
				sendMessage(ShieldWarningMessage);
				shieldWarned = true;
			} else if (bossHp <= 0) {
				boss = null;
				clearTimeout(timerNextMechanic);
			}
		}
	 })
			
	dispatch.hook('S_ACTION_STAGE', 1, (event) => {
		if (!enabled || !boss) return;
		
		if (boss.id - event.source == 0) {
			 if (BossActions[event.skill]) {
				sendMessage(BossActions[event.skill].msg);
				
				if (!showNextMechanicMessage) return;

				let nextMessage;
				if (BossActions[event.skill].next) {
					nextMessage = BossActions[BossActions[event.skill].next].msg;
				} else if (event.skill == 1192035705) { // Shield (Mechanics inversed)
					nextMessage = BossActions[InversedAction[lastMechanicAction]].msg;
				}
				
				if (nextMessage) {
					lastMechanicAction = event.skill;
					startTimer('Next: ' + nextMessage);
				}
			}			
		}
	})
	
	function startTimer(message) {
		if (timerNextMechanic) clearTimeout(timerNextMechanic);
		timerNextMechanic = setTimeout(() => {
			sendMessage(message);
			timerNextMechanic = null;
		}, 10000);	
	}
	
	dispatch.hook('S_LOGIN', 2, (event) => {
		playerName = event.name;
	})
		
	function sendMessage(msg) {
		if (!enabled) return;
		
		if (sendToParty) {
			dispatch.toServer('C_CHAT', {
				channel: 21, //p-notice
				//authorName: 'DG-Guide',
				authorName: playerName,
				message: msg
			});
		} else {
			dispatch.toClient('S_CHAT', 1, {
				channel: 21, //21 = p-notice, 1 = party
				authorName: 'DG-Guide',
				message: msg
			});
		}		
	}	
		
	function systemMessage(msg) {
		dispatch.toClient('S_CHAT', 1, {
			channel: 24, //system channel
			authorName: '',
			message: ' (VSNM-Lakan-Guide) ' + msg
		});
	}

}