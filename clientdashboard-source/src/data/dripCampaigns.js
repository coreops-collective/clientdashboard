// Auto-generated from drip campaign documents
// Source: CoreOps campaign templates

// Mapping of raw doc placeholders -> semantic keys
const RAW_TAG_MAP = [
  ['#lead_first_name#', 'firstName'],
  ['#agent_name#', 'agentName'],
  ['#agent_sending_email#', 'agentName'],
  ['#agent_phone#', 'phone'],
  ['#signature#', 'agentName'],
  ['[Phone Number]', 'agentPhone'],
  ['[Your Number]', 'agentPhone'],
  ['[Brokerage]', 'brokerage'],
  ['[Website]', 'website'],
  ['[Market]', 'market'],
  ['[Your Market]', 'market'],
  ['(client first name)', 'firstName'],
  ['(agent signature)', 'agentName'],
  ['#business_name#', 'brokerage'],
  ['Heart and Hustle', 'brokerage'],
];

// CRM-specific merge tags (verified accurate per platform)
export const CRM_MERGE_TAGS = {
  generic: {
    firstName: '[FIRST_NAME]', lastName: '[LAST_NAME]', email: '[EMAIL]',
    phone: '[PHONE]', address: '[PROPERTY_ADDRESS]', agentName: '[AGENT_NAME]',
    agentPhone: '[AGENT_PHONE]', brokerage: '[BROKERAGE]', website: '[WEBSITE]',
    market: '[MARKET_AREA]', date: '[DATE]',
  },
  fub: {
    firstName: '{{contact.first_name}}', lastName: '{{contact.last_name}}',
    email: '{{contact.email}}', phone: '{{contact.phone_number}}',
    address: '{{contact.addresses[0].street}}', agentName: '{{user.name}}',
    agentPhone: '{{user.phone}}', brokerage: '{{user.team_name}}',
    website: '{{user.website}}', market: '{{user.market_area}}', date: '{{current_date}}',
  },
  boldtrail: {
    firstName: '%%first_name%%', lastName: '%%last_name%%',
    email: '%%email%%', phone: '%%phone%%',
    address: '%%street_address%%', agentName: '%%agent_first_name%% %%agent_last_name%%',
    agentPhone: '%%agent_phone%%', brokerage: '%%company_name%%',
    website: '%%agent_website%%', market: '%%market_area%%', date: '%%current_date%%',
  },
  sierra: {
    firstName: '{FirstName}', lastName: '{LastName}',
    email: '{EmailAddress}', phone: '{Phone}',
    address: '{Address}', agentName: '{AgentName}',
    agentPhone: '{AgentPhone}', brokerage: '{OfficeName}',
    website: '{AgentWebsite}', market: '{MarketArea}', date: '{CurrentDate}',
  },
  lofty: {
    firstName: '{{lead.first_name}}', lastName: '{{lead.last_name}}',
    email: '{{lead.email}}', phone: '{{lead.phone}}',
    address: '{{lead.address}}', agentName: '{{agent.name}}',
    agentPhone: '{{agent.phone}}', brokerage: '{{company.name}}',
    website: '{{agent.website}}', market: '{{agent.market_area}}', date: '{{current_date}}',
  },
  brivity: {
    firstName: '{{recipient_first_name}}', lastName: '{{recipient_last_name}}',
    email: '{{recipient_email}}', phone: '{{recipient_phone}}',
    address: '{{property_address}}', agentName: '{{sender_first_name}} {{sender_last_name}}',
    agentPhone: '{{sender_phone}}', brokerage: '{{sender_company}}',
    website: '{{sender_website}}', market: '{{market_area}}', date: '{{date}}',
  },
  gohighlevel: {
    firstName: '{{contact.first_name}}', lastName: '{{contact.last_name}}',
    email: '{{contact.email}}', phone: '{{contact.phone}}',
    address: '{{contact.address1}}', agentName: '{{user.first_name}} {{user.last_name}}',
    agentPhone: '{{user.phone}}', brokerage: '{{location.name}}',
    website: '{{location.website}}', market: '{{custom_values.market_area}}', date: '{{current_date}}',
  },
  other: {
    firstName: '[FIRST_NAME]', lastName: '[LAST_NAME]', email: '[EMAIL]',
    phone: '[PHONE]', address: '[ADDRESS]', agentName: '[AGENT_NAME]',
    agentPhone: '[AGENT_PHONE]', brokerage: '[BROKERAGE]', website: '[WEBSITE]',
    market: '[MARKET_AREA]', date: '[DATE]',
  },
};

/**
 * Replace raw doc placeholders with CRM-specific merge tags.
 * @param {string} text - raw template text from the docs
 * @param {string} crmId - selected CRM key (e.g. 'fub', 'sierra')
 * @returns {string} text with CRM merge tags substituted
 */
export function applyMergeTags(text, crmId) {
  if (!text) return text;
  const tags = CRM_MERGE_TAGS[crmId] || CRM_MERGE_TAGS.generic;
  let result = text;
  for (const [rawTag, semanticKey] of RAW_TAG_MAP) {
    if (tags[semanticKey]) {
      // Use split/join for literal string replacement (no regex escaping needed)
      result = result.split(rawTag).join(tags[semanticKey]);
    }
  }
  return result;
}

export const DRIP_CAMPAIGNS = {
  "welcome-10day": {
    "name": "10-Day Welcome Sequence",
    "notes": "10-Day Multi-Channel Welcome Sequence\n5 Emails - 3 Texts - 10 Calls\nSTOP THE SEQUENCE: If they reply, book a consultation, or ask you to stop. Switch to manual follow-up.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "A quick hello and what you can expect from us",
        "body": "Hi #lead_first_name#,\nWe're so glad you reached out.\nI'm #agent_name# with #business_name#, and our team serves [Market] and the surrounding communities. We work with people who are usually in some kind of transition. Growing, downsizing, relocating, starting fresh. Trying to figure out how all the moving pieces fit together.\nWhat we love about this work is that it is never just about a house. It is about helping people move into the next chapter with clarity and confidence.\nWhat drives us a little crazy is when people feel overwhelmed or rushed through something this important.\nThat is why we do things differently. We walk you through the process step by step. We explain things in plain language. We treat every client the same way regardless of price point. And we make sure you never feel like you are figuring it out alone.\nWhat has you exploring right now? Buying, selling, or just starting to think about it?\nHit reply and let me know. We've got you.\n#agent_name#\n[Phone Number]\n[Brokerage]\n[Website]"
      },
      {
        "day": "DAY 1",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, it's #agent_name# with #business_name#. You reached out and I just wanted to personally introduce myself and see what's on your mind. Do you have a quick minute?\"\nIF VOICEMAIL:\n\"Hey #lead_first_name#, #agent_name# here with #business_name#. Just wanted to introduce myself and make sure you got my email. If you have any questions, I'm here to help. Call me back at [Your Number].\""
      },
      {
        "day": "DAY 2",
        "type": "text",
        "subject": "",
        "body": "Hi #lead_first_name#, this is #agent_name# with #business_name#. Just wanted to check in and make sure you got my email yesterday. Any questions I can answer for you?"
      },
      {
        "day": "DAY 2",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, #agent_name# checking in. Just wanted to make sure you have what you need and see if there's anything I can clarify.\"\nIF VOICEMAIL:\n\"Hi, it's #agent_name#. Just making sure you got my note and seeing if any questions have come up. No pressure at all. I'm here when you're ready.\""
      },
      {
        "day": "DAY 3",
        "type": "email",
        "subject": "What the process really looks like",
        "body": "Hi #lead_first_name#,\nOne of the biggest stress points in real estate is not knowing what to expect.\nWhether you are buying or selling, the process feels overwhelming when you cannot see the full picture.\nHere is what we focus on first.\nClarity. We map out timing, finances, and next steps so nothing feels rushed.\nPreparation. The more prepared you are, the more confident you feel.\nStrategy. Every situation is different. What works beautifully for one family may not make sense for another.\nOur job is to simplify the moving parts so you feel steady, not stressed.\nIf you would like to talk through your specific situation, we are happy to. One step at a time.\n#agent_name#\n[Phone Number]\n[Brokerage]\n[Website]"
      },
      {
        "day": "DAY 3",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, I just sent you a quick email about how the process works. I would love to answer any questions you might have.\"\nIF VOICEMAIL:\n\"I sent you a quick note about what the process typically looks like. If you want to talk it through, I'm here.\""
      },
      {
        "day": "DAY 4",
        "type": "text",
        "subject": "",
        "body": "Hi #lead_first_name#, this is #agent_name#. Quick question. What is your timeline looking like right now? Are you thinking in the next few months or more down the road? Just want to make sure I am sending what is actually helpful."
      },
      {
        "day": "DAY 4",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, still trying to connect. I promise I am not chasing you. Just making sure you are getting what you need.\"\nIF VOICEMAIL:\n\"#agent_name# again. Just making myself available if you have questions. When you are ready, we will get to the finish line together.\""

      },
      {
        "day": "DAY 5",
        "type": "email",
        "subject": "A quick story that might sound familiar",
        "body": "Hi #lead_first_name#,\nWe recently worked with a family who was in the middle of a big life transition. They were trying to figure out how to move from one home into another without feeling displaced or financially stretched.\nThey were stressed and unsure how the timing would work.\nSo we mapped it out step by step.\nConnected them with the right lender.\nCoordinated contractors.\nManaged timelines carefully.\nOne last step at a time.\nThey closed smoothly and told us afterward they did not realize how much was happening behind the scenes.\nThat is the part people do not always see. The coordination. The problem solving. The steady communication.\nYour situation may be completely different. But there is almost always a strategy that makes it smoother than you think.\nIf you would like to talk through yours, we are here.\n#agent_name#\n[Phone Number]\n[Brokerage]\n[Website]"
      },
      {
        "day": "DAY 5",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, I sent you a quick story about a client navigating a transition. Thought it might be helpful.\"\nIF VOICEMAIL:\n\"Check your email when you can. I shared a short story that might resonate. Happy to talk it through.\""

      },
      {
        "day": "DAY 6",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, I have sent a few things this week and just wanted to ask directly. Are you planning something soon, or are you more in the early research stage?\"\nIF VOICEMAIL:\n\"Quick question. Are you thinking near term or just gathering information for now? Texting me back works too.\""

      },
      {
        "day": "DAY 7",
        "type": "email",
        "subject": "Do this before you start",
        "body": "Hi #lead_first_name#,\nBefore buying or listing, there are a few things that make the process much smoother.\nUnderstand your real numbers. Clarity brings confidence.\nTalk through timing. Especially if buying and selling at the same time.\nStart decluttering early. Small steps reduce stress later.\nAsk questions. You are not supposed to know everything. That is our job.\nChoose guidance you trust. The right support changes everything.\nIf you want to walk through any of this, we will break it into manageable pieces.\nWe are here to take the stress away.\n#agent_name#\n[Phone Number]\n[Brokerage]\n[Website]"
      },
      {
        "day": "DAY 7",
        "type": "call",
        "subject": "",
        "body": "\"I sent you a short list of things to think about before getting started. Want to walk through any of it together?\"\nIF VOICEMAIL:\n \"Check your email. I sent a few simple steps that make the process smoother. Could save you stress later.\""

      },
      {
        "day": "DAY 8",
        "type": "text",
        "subject": "",
        "body": "Hi #lead_first_name#, this is #agent_name#. Real question. Are you actively looking right now or more in the someday phase? I just want to match your pace."
      },
      {
        "day": "DAY 8",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, I have shared a lot this week. I just want to make sure it is helpful and not overwhelming.\"\nIF VOICEMAIL:\n\"Just checking in. I want to be supportive, not noisy. Let me know what stage you are in.\""

      },
      {
        "day": "DAY 9",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, I will probably pause outreach after this unless I hear from you. Just wanted to make one more attempt to connect and see if you needed anything.\"\nIF VOICEMAIL:\n\"This will probably be my last call for now. If you do want to talk through buying or selling, I am here. No pressure either way.\""

      },
      {
        "day": "DAY 10",
        "type": "email",
        "subject": "Just making sure we did not miss you",
        "body": "Hi #lead_first_name#,\nI have reached out a few times and have not heard back, so I just wanted to check in one last time.\nIf your plans changed, that is completely okay.\nIf you are still thinking about buying or selling but just busy, that is normal too.\nIf you found another agent, that is okay as well.\nWe believe in clarity and communication, so I did not want to assume.\nIf you would like to talk through your options, even if it is months from now, we are here. We will move at your pace and keep things calm and steady.\nEither way, wishing you the very best.\n#agent_name#\n[Phone Number]\n[Brokerage]\n[Website]"
      },
      {
        "day": "DAY 10",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#, I sent one last email just making sure I did not miss you. If you need space or timing is not right, that is completely fine. I just wanted to check.\"\nIF VOICEMAIL:\n\"Hi, it's #agent_name#. Just wanted to make sure everything is okay and that I did not miss something. I will pause outreach for now, but I am here whenever you need me.\"\nHOW TO USE THIS SEQUENCE\nWhy call every day? Because most people don't answer the first time. Or the second. You're creating familiarity so when they DO answer, you're not a stranger. Persistence ≠ annoying.\nMix up call times: Don't call at 10am every day. Try mornings, evenings, lunch. People have patterns - find theirs.\nIf they reply to ANYTHING: Stop the automation immediately. Switch to manual follow-up. Be a human.\nAfter Day 10: Move them to your long-term drip campaign based on engagement (Hot/Watch/Nurture). Stop daily calls but stay in touch monthly.\nTrack engagement: Email opens, text replies, call answers. This tells you who's hot vs. who's just browsing.\nMake it yours: These scripts are guides. Use your own words. Sound like yourself, not a robot reading from a template."
      }
    ]
  },
  "buyer-hot": {
    "name": "HOT BUYER LEAD CAMPAIGN (0-90 DAYS)",
    "notes": "12-Week (90-Day) Follow-Up System\n⚠️ STOP THE SEQUENCE: When they go under contract on a property. Switch to transaction management and closing coordination.\nCRM AUTOMATION RULES:\n DO NOT pause this campaign when leads respond or engage.\n ONLY pause/remove from campaign if:\nLead explicitly states their timeline has changed and they are no longer buying/selling in this timeframe\nLead has listed/gone under contract with another agent\nLead requests to stop receiving communications\nLead converts to active client and enters your active buyer/seller workflow\nIf lead responds with questions, interest, or engagement: Keep them in campaign AND respond personally. Automated touches continue.\nAfter the final touch, wait 30 days. If no activity, update stage/status to COLD and trigger the COLD DRIP CAMPAIGN.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "The one thing most buyers get wrong about [Your Market]",
        "body": "Hey #lead_first_name#,\nYou're looking at houses. Scrolling. Saving favorites. Maybe even driving through neighborhoods.\nBut here's what most buyers miss.\nThey get so focused on finding the perfect house that they forget they are choosing a life.\nNot just square footage and finishes. But what your Saturdays feel like. Where you'll grab coffee. How far everything is. Whether your neighborhood feels like community or just a row of houses.\nHere's what we help our buyers do. Find the house and the life that comes with it.\nBecause five years from now, you probably will not remember if you negotiated five thousand off. But you will remember if you love where you live.\nIf you want to talk about what you are actually looking for, not just beds and baths, reply and tell me what you want your everyday life to feel like. We will figure it out together.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 3",
        "type": "text",
        "subject": "",
        "body": "That email I sent about finding the life, not just the house, it's real. Most agents just show what's available. I help you find where you'll actually be happy."
      },
      {
        "day": "DAY 5",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Wanted to check in and see what you're actually looking for, not just the house specs, but the lifestyle stuff. That's where the good conversations start.\"\nVOICEMAIL:\n \"Quick check in. I'd love to hear what matters to you beyond just the house itself. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 8",
        "type": "email",
        "subject": "Here's what I actually do (it's not what you think)",
        "body": "#lead_first_name#,\nMost people think real estate agents show houses and write offers.\nThat is part of it. But it is not the real job.\nThe real job is making sure you do not make an expensive mistake.\nI'm the one who notices what is easy to miss. The hidden costs, the red flags, the details that impact your day to day life. The things that look small in a listing but turn into big stress later.\nI'm also the one who helps you see what is worth it. The house that is not perfectly styled but has great bones. The one with cosmetic updates needed but a layout that works. The place that might not photograph well, but feels right when you walk in.\nYou can learn all of this the hard way. Or you can work with someone who has seen a lot, learned a lot, and can guide you through it calmly.\nThat is what I bring. Not just access to homes. You've got the internet for that.\nI bring clarity, strategy, and someone steady in your corner.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 11",
        "type": "text",
        "subject": "",
        "body": "Quick question. When you're looking at houses, are you looking for perfect or are you looking for potential? That answer changes everything."
      },
      {
        "day": "DAY 13",
        "type": "call",
        "subject": "",
        "body": "\"Hey! I've been thinking about what you're searching for. Want to talk through what you're seeing out there?\"\nVOICEMAIL:\n \"Would love to chat about your search and see if I can help you spot opportunities you might be missing. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 15",
        "type": "email",
        "subject": "What actually matters to you in a neighborhood (most people guess wrong)",
        "body": "Hey #lead_first_name#,\nA lot of buyers pick neighborhoods for the wrong reasons.\nThey chase what sounds good on paper. What they think they should want. What other people tell them is best.\nThen they move in and realize it doesn't fit their real life.\nHere's what smart buyers do instead.\nThey get clear on what actually matters to them.\nDo you want quiet or energy? Space or community? Privacy or neighbors who know your name? Short commute or bigger house? New and low maintenance or charm and character?\nNone of these are right or wrong. They are your answers.\nHere are a few questions that help clarify it fast:\nWhat does a perfect Saturday look like for you?\nDo you want to be out and about, or home and tucked in?\nDo you want to know your neighbors or keep to yourself?\nDoes a longer drive bother you or is it worth it for more space?\nDo you need room for hobbies, guests, projects, or animals?\nThere is no perfect neighborhood. There is the one that fits how you actually live.\nIf you want to talk it through, tell me what matters most and I will help you narrow it down so you are not chasing the wrong thing.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 18",
        "type": "text",
        "subject": "",
        "body": "If you tell me what matters to you (walkability, quiet streets, good schools, local spots), I can point you toward the right neighborhoods. Just let me know."
      },
      {
        "day": "DAY 20",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Question for you. Are you locked into specific areas or open to exploring neighborhoods you might not know about yet?\"\nVOICEMAIL:\n \"Wanted to talk neighborhoods. Some areas are a better fit than others and it's not always obvious online. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 22",
        "type": "email",
        "subject": "How [Client Name] found their place (when it felt like nothing was working)",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey were discouraged. They had been looking, thinking, hoping, and nothing was clicking. Everything felt like a compromise.\nSo we got back to basics. Clear priorities. Smart strategy. Calm pace.\nWe stopped chasing the same homes everyone else was chasing and focused on opportunities that were being overlooked. Not because the homes were bad, but because they needed the kind of vision and confidence most buyers do not have when they feel rushed.\nWe found the right fit. Negotiated cleanly. Kept the process steady. And they got a home that actually matched their life.\nThat is always the goal. Not just finding a house, but helping you win without the stress spiral.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 25",
        "type": "text",
        "subject": "",
        "body": "That story I sent is the approach. Not just showing you houses. Actually helping you win. Let me know if you want that kind of help."
      },
      {
        "day": "DAY 27",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Wanted to see if you've found anything that feels right or if everything is missing something.\"\nVOICEMAIL:\n\"Quick check in. I'm here if you want to talk strategy or see some places. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 29",
        "type": "email",
        "subject": "The mistake that costs buyers thousands (and how to avoid it)",
        "body": "Hey #lead_first_name#,\nHere's what I see all the time.\nBuyers fall in love during a showing and miss the expensive stuff.\nThey see the updated kitchen and overlook the big ticket items. They love the backyard and forget to ask about long term costs. They get swept up in the moment and do not realize what will matter once the excitement wears off.\nHere's the good news. It is not your job to catch all of this.\nIt is mine.\nThat is why having the right guide matters. Someone who stays calm, asks the uncomfortable questions, and helps you make a smart decision that still feels good later.\nIf you want that kind of protection and clarity, let's talk.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 32",
        "type": "text",
        "subject": "",
        "body": "Real talk. What is the one thing that would make you feel ready to move forward right now? Finding the right house, price, timing, something else?"
      },
      {
        "day": "DAY 34",
        "type": "call",
        "subject": "",
        "body": "\"Quick question. What's holding you back from making an offer right now? Maybe I can help with that.\"\nVOICEMAIL:\n \"Wanted to talk about what's keeping you from moving forward. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 36",
        "type": "email",
        "subject": "The local spots that actually matter",
        "body": "#lead_first_name#,\nYou are not just buying a house. You are buying access to a community.\nThat is the part people forget until they are living it.\nThe little routines become your life. Where you grab coffee. Where you walk. Where you run errands. Where you take visitors. Where you feel like you belong.\nThis is the kind of thing Zillow can't show you.\nIf you tell me what areas you are exploring, I can share the local spots, the vibe, and what living there actually feels like day to day.\nIf you want a short list of \"you should know this place\" recommendations, just reply and tell me what part of town you're drawn to.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 39",
        "type": "text",
        "subject": "",
        "body": "When you tour houses, are you checking out the neighborhood too? The vibe matters as much as the house."
      },
      {
        "day": "DAY 41",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Been thinking about your search. Want to talk about neighborhoods and community, not just houses?\"\nVOICEMAIL:\n \"Let's talk about the lifestyle side of this. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 43",
        "type": "email",
        "subject": "What I'm really watching for when we walk a house",
        "body": "Hey #lead_first_name#,\nWhen you walk into a house, it's easy to notice paint colors, countertops, and the way it's staged.\nI'm watching different things.\nI'm looking for the details that affect your wallet, your comfort, and your future. The stuff that doesn't show up in photos, but absolutely shows up after closing if it gets missed.\nCosmetic updates are usually manageable. Structural and systems issues are where things get expensive fast.\nAnd here's the other side. I also look for potential. The homes that are not perfectly styled but have great bones. The ones other buyers skip too quickly.\nThat is the value of having an experienced guide. Knowing what matters and what doesn't.\nIf you want my full walkthrough checklist, reply and I will send it.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 46",
        "type": "text",
        "subject": "",
        "body": "Pro move. When you tour a house, turn on all the faucets. Water pressure issues are expensive to fix and easy to miss."
      },
      {
        "day": "DAY 48",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Have you been touring places? Want to know what to look for beyond the pretty stuff?\"\nVOICEMAIL:\n \"If you're seeing houses, I can tell you what to actually pay attention to. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 50",
        "type": "email",
        "subject": "The opportunities most buyers miss",
        "body": "#lead_first_name#,\nMost buyers are looking at the same homes.\nNew listings. Perfect condition. Move in ready.\nAnd everyone competes for them.\nHere's what smart buyers do. They stay open to opportunity.\nSometimes the best home is not the prettiest one. Sometimes it needs a little cosmetic love but has the location, layout, and bones you cannot change. Sometimes it has been sitting simply because the price is wrong and the seller is ready to negotiate.\nThat is where leverage lives.\nIf you want help spotting those opportunities and knowing when to move, let's talk.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 53",
        "type": "text",
        "subject": "",
        "body": "Question. Are you looking for move in ready or are you open to a place with potential? Your answer changes where we should be looking."
      },
      {
        "day": "DAY 55",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Wanted to talk strategy. There are opportunities out there but you have to know where to look.\"\nVOICEMAIL:\n \"Let's talk about finding opportunities most people miss. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 57",
        "type": "email",
        "subject": "The houses buyers walk past too fast (and why that matters)",
        "body": "Hey #lead_first_name#,\nI watch buyers dismiss houses in seconds all the time.\nThey pull up. Look at the outside. Decide it is not worth it. Drive away.\nAnd sometimes they are right.\nBut often, they are trading substance for surface.\nSome of the strongest homes are not the flashiest ones. Great bones, solid layout, good lot, good location. They just do not photograph like a magazine.\nThe buyers who win long term are the ones who can look past cosmetic distractions and see what actually matters.\nYou do not have to buy the prettiest house. You have to buy the smartest house for your life.\nIf you want help learning what to look for beyond the surface, I will show you.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 60",
        "type": "text",
        "subject": "",
        "body": "Cosmetics are usually the easy part. Location and structure are not. If you find great bones in a great spot, you can make the rest yours over time."
      },
      {
        "day": "DAY 62",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Just wanted to check in and see how the search is going. Finding anything interesting?\"\nVOICEMAIL:\n\"Just checking in on your search. Hope you're doing well. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 64",
        "type": "email",
        "subject": "What your weekends will actually look like",
        "body": "#lead_first_name#,\nHere's something most buyers do not think about until after they move.\nYou are not just choosing square footage. You are choosing how your everyday life feels.\nThe house you pick influences your routines. Your commute. Your errands. Your weekends. Your connection to community.\nMost buyers pick the house and hope the lifestyle works out.\nSmart buyers pick the lifestyle first, then find the house that supports it.\nWhat do you want your weekends to feel like? Quiet and private? Walkable and social? Space to spread out? Close to everything?\nReply and tell me what you want the life part to look like, and we will narrow the search from there.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 67",
        "type": "text",
        "subject": "",
        "body": "That email about choosing your lifestyle is the real question. What do you actually want your weekends to feel like?"
      },
      {
        "day": "DAY 69",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That lifestyle question I sent, want to talk through what you're actually looking for beyond the house specs?\"\nVOICEMAIL:\n\"Let's talk about the life you want, not just the house. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 71",
        "type": "email",
        "subject": "The real cost of waiting",
        "body": "Hey #lead_first_name#,\nI get it. It is easy to wait for perfect.\nPerfect house. Perfect timing. Perfect market.\nBut here is what happens while you wait.\nThe right homes come and go. Good opportunities get scooped up by buyers who were prepared. And sometimes the thing you thought was a deal breaker was actually a very fixable cosmetic issue.\nI am not saying buy something that is wrong for you. Please don't do that.\nI am saying that perfect rarely exists. And waiting for it can keep you stuck.\nThe buyers who do best are the ones who recognize a strong fit and move with confidence, not panic.\nIf you want to talk about what \"right\" looks like for you, let's figure it out together.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 74",
        "type": "text",
        "subject": "",
        "body": "Be honest. Are you waiting for perfect or are you ready to move on something that is really good? There is a big difference."
      },
      {
        "day": "DAY 76",
        "type": "call",
        "subject": "",
        "body": "\"Quick question. What would it take for you to actually make an offer? What are you really waiting for?\"\nVOICEMAIL:\n \"Want to understand what you're waiting for so I can help you find it. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 78",
        "type": "email",
        "subject": "Did I miss something?",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey were worn out. They had been looking, losing, and starting to think it just was not going to happen.\nThen something came up that was not fully public yet.\nBecause I knew what they wanted, I was watching for it. When it appeared, I reached out immediately. They saw it quickly, moved confidently, and got it without a bidding war.\nHere is why this matters.\nThe best opportunities do not always show up in your alerts. Sometimes they are coming soon. Sometimes they are pre market. Sometimes they are homes I know are about to list because of relationships and conversations happening behind the scenes.\nMost buyers only see what is publicly listed.\nMy buyers see more than that, because we are paying attention.\nIf you want that kind of support and awareness working in your favor, reply and tell me what you are looking for and what your timeline is. I will take it from there.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 81",
        "type": "text",
        "subject": "",
        "body": "Best houses I've found for buyers weren't on the MLS yet. Knowing what's coming before everyone else sees it is a real advantage."
      },
      {
        "day": "DAY 83",
        "type": "call",
        "subject": "",
        "body": "\"Hey. I sent you an email asking if I missed something. I genuinely want to know if you're still looking or if you need space. No hard feelings either way. I just want to know where we stand.\"\nVOICEMAIL:\n \"Need an honest answer about where you're at. Check your email and let me know. [Your Number].\""

      }
    ]
  },
  "seller-hot": {
    "name": "HOT SELLER LEAD CAMPAIGN (0-90 DAYS)",
    "notes": "12-Week Follow-Up System\nWeekly Touches: 1 Email - 1 Text - 1 Call Per Week\nTHE APPROACH:\n Active nurture for sellers thinking about listing soon. Weekly education on strategy, positioning, and what actually works.\n⚠️ TRANSITION TO PRE-LISTING: When they commit to listing, move to pre-listing workflow with walkthrough, pricing, and tactical preparation.\nCRM AUTOMATION RULES:\n DO NOT pause this campaign when leads respond or engage.\n ONLY pause/remove from campaign if:\nLead explicitly states their timeline has changed and they are no longer buying/selling in this timeframe\nLead has listed/gone under contract with another agent\nLead requests to stop receiving communications\nLead converts to active client and enters your active buyer/seller workflow\nIf lead responds with questions, interest, or engagement: Keep them in campaign AND respond personally. Automated touches continue.\nAfter the final touch, wait 30 days. If no activity, update stage/status to COLD and trigger the COLD DRIP CAMPAIGN.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "What smart sellers do that most don't",
        "body": "Hey #lead_first_name#,\nMost sellers wait until they are ready to list and then everything hits at once. Cleaning, repairs, pricing, photos, paperwork. It can feel like a lot.\nSmart sellers do something different.\nThey start noticing what buyers will notice. They knock out small repairs over time instead of in a stressful weekend sprint. They pay attention to what is selling and why. They get clear on what their home is actually worth, and what will help it shine when it hits the market.\nBy the time they list, they are not guessing. They are prepared.\nOver the next few weeks, I am going to share the practical stuff that actually moves the needle. The small details buyers care about. What tends to derail deals. What creates momentum and strong offers.\nWe will build your knowledge now so when you are ready, it feels calm and straightforward.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 3",
        "type": "text",
        "subject": "",
        "body": "Drive by a few homes for sale in your neighborhood this week. Notice which ones feel cared for from the street and which ones don't. Buyers decide a lot in the first few seconds."
      },
      {
        "day": "DAY 5",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Hope you're doing well. Just wanted to touch base and see how everything's going.\"\nVOICEMAIL:\n\"Just a friendly check in. Hope you're doing well. Call me back when you have a chance at [Your Number].\""

      },
      {
        "day": "DAY 8",
        "type": "email",
        "subject": "What buyers notice in the first 10 seconds",
        "body": "#lead_first_name#,\nBuyers form an opinion about a home fast. Usually within the first few seconds.\nHere's what they are registering right away: curb appeal from the street, the front entry, how bright it feels when they walk in, and whether the home feels clean and cared for.\nThey are not always thinking it through logically. They are feeling it.\nIf those first moments feel good, buyers walk through looking for reasons to say yes. If those first moments feel off, they walk through looking for reasons to leave.\nMost sellers focus on big projects, but overlook the small things that shape first impression. A front door that needs paint. A cluttered entry. A smell you do not notice anymore. Windows that need a deep clean. Lighting that is dim.\nThe homes that sell quickly usually get the first 10 seconds right. Not with expensive renovations, but with simple clarity and care.\nFirst impressions are not everything, but they set the tone for everything else.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 11",
        "type": "text",
        "subject": "",
        "body": "Homes that get strong offers have one thing in common. They feel cared for from the moment you pull up."
      },
      {
        "day": "DAY 13",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Just checking in. Have you had a chance to notice anything you'd want to tackle before listing, even small stuff?\"\nVOICEMAIL:\n \"Hope you're doing well. Just checking in. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 15",
        "type": "email",
        "subject": "The small fix that prevents a big negotiation",
        "body": "Hey #lead_first_name#,\nSmall broken things can create big doubt for buyers.\nNot because the fix is expensive, but because it signals deferred maintenance.\nA leaky faucet might be a quick repair. But buyers read it as, \"If this is visible, what else is hiding?\" A loose handle, a sticky door, a window that will not open. Individually, they are minor. Together, they create a story.\nThen inspection comes. The buyer finds a long list of little things and now they feel justified asking for a big credit. Not because the repairs actually cost that much, but because confidence has dropped.\nThe smart move is simple. Fix the small stuff now. Every drip, every loose handle, every stubborn door, every lightbulb out.\nBuyers pay more for homes that feel maintained.\nSmall fixes now, or bigger negotiations later.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 18",
        "type": "text",
        "subject": "",
        "body": "Small repairs matter because they build buyer confidence. Fix the cheap stuff now so buyers assume everything else has been handled too."
      },
      {
        "day": "DAY 20",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to touch base and see how you're doing. Everything going well?\"\nVOICEMAIL:\n \"Hope you're doing well. Just staying in touch. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 22",
        "type": "email",
        "subject": "How we price a home (and why guessing costs money)",
        "body": "#lead_first_name#,\nPricing is one of the biggest reasons a listing either takes off or sits.\nA lot of sellers are given a price that feels good, but does not match what buyers are actually paying.\nHere's how we approach pricing.\nWe study recent sales, not just active listings. We compare condition, layout, location, and upgrades. We look at what buyers are responding to right now. Then we choose the price that creates momentum, not just a number that sounds nice.\nOverpricing usually creates the opposite of what sellers want. It slows showings, limits urgency, and makes the home feel stale. Then reductions happen later, but the listing has lost its early attention.\nThe goal is to price in a way that makes buyers move, not hesitate.\nWhen you are ready, I will give you the real number, supported by data and buyer behavior, with a clear strategy behind it.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 25",
        "type": "text",
        "subject": "",
        "body": "Pricing should create momentum, not hope. The right price gets attention early, and that is where the best outcomes happen."
      },
      {
        "day": "DAY 27",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope everything's going well. Just wanted to check in and see how you're doing.\"\nVOICEMAIL:\n \"Hope you're doing well. Just staying in touch. Call me when you have time at [Your Number].\""

      },
      {
        "day": "DAY 29",
        "type": "email",
        "subject": "What your home is actually worth (and what influences it most)",
        "body": "Hey #lead_first_name#,\nYour home is worth what a buyer will pay for it today.\nNot what you paid. Not what you need. Not what an online estimate suggests. Not what the neighbor got years ago.\nValue is shaped by recent comparable sales, current competition, condition, buyer demand, and how your home compares to what else is available right now.\nOnline estimates can be a data point, but they cannot see what a buyer feels walking through your home. They do not account for the street, the lot, the layout, or the way a home has been cared for.\nThe biggest pricing truth is this. If you price correctly from day one, you create urgency. If you price too high, you end up negotiating from weakness later.\nWhen you are ready, I can run the numbers and walk you through it in plain language.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 32",
        "type": "text",
        "subject": "",
        "body": "Pricing is not about what you want or need. It is about what buyers will pay. Getting it right on day one makes everything smoother."
      },
      {
        "day": "DAY 34",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just checking in. How are things on your end?\"\nVOICEMAIL:\n \"Hope you're doing well. Just staying in touch. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 36",
        "type": "email",
        "subject": "Why photos matter more than most sellers realize",
        "body": "#lead_first_name#,\nListing photos are not a small detail. They are the first showing.\nMost buyers start online. They scroll quickly. If photos are dark, cluttered, or rushed, they move on, even if the home is great.\nProfessional photos do a few important things: they capture light correctly, show space accurately, and help a home feel clean and inviting. Good photos create showings. Showings create offers.\nThis is one of the easiest places to protect your outcome.\nWhen we list, we do not cut corners here. We want buyers to feel something the moment they see your home online.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 39",
        "type": "text",
        "subject": "",
        "body": "A home that photographs well creates more showings, and more showings create stronger offers. Photos matter."
      },
      {
        "day": "DAY 41",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope everything's going well. Just wanted to touch base and see how you're doing.\"\nVOICEMAIL:\n \"Just checking in. Hope you're doing well. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 43",
        "type": "email",
        "subject": "How my past client got multiple offers quickly",
        "body": "Hey #lead_first_name#,\nLet me tell you about [Client Name].\nTheir home was solid, but they were worried it would blend in with other options buyers had.\nSo we focused on what we can control. Clean and simple prep. Fixing the small stuff. Strategic pricing that created urgency. Professional photos that showed the home at its best. A launch plan that made the first weekend count.\nThe result was strong showing activity and multiple offers quickly.\nHere's the takeaway. It was not luck. It was preparation and positioning.\nGood strategy beats a perfect house every time.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 46",
        "type": "text",
        "subject": "",
        "body": "Preparation and positioning matter more than fancy finishes. Strategy wins."
      },
      {
        "day": "DAY 48",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to check in and see how you're doing. Everything good?\"\nVOICEMAIL:\n \"Hope you're doing well. Just staying in touch. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 50",
        "type": "email",
        "subject": "Why some homes sell fast and others sit",
        "body": "#lead_first_name#,\nTwo homes can be similar on paper and have totally different results.\nOne sells quickly. The other sits.\nMost of the time, the difference is execution.\nHomes that sell fast tend to have:\nThe right price from day one\nA clean, bright, cared-for feel\nProfessional marketing and strong photos\nEasy access for showings\nA plan for feedback and adjustments if needed\nHomes that sit often have the opposite. Price that is too high. Photos that do not help. Prep that feels rushed. Limited showing availability. No clear strategy.\nWhen we list your home, we are not hoping. We are executing a plan.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 53",
        "type": "text",
        "subject": "",
        "body": "Execution beats hope every time. Homes that sell fast are prepared and positioned well."
      },
      {
        "day": "DAY 55",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope everything's good. Just wanted to check in and see how you're doing.\"\nVOICEMAIL:\n \"Just checking in. Hope you're doing well. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 57",
        "type": "email",
        "subject": "How [Client Name] came out ahead by trusting strategy",
        "body": "Hey #lead_first_name#,\nLet me tell you about [Client Name].\nThey had a price in mind. It felt right. They had reasons.\nBut when we looked at recent sales and buyer behavior, a different strategy made more sense.\nWe priced to create momentum. We prepared intentionally. We launched strong.\nAnd the outcome was better than they expected.\nThis is why we lead with clarity. The market pays what it pays. Strategy helps you get the best version of it.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 60",
        "type": "text",
        "subject": "",
        "body": "The market pays what it pays. Strategy is how you get the strongest outcome within it."
      },
      {
        "day": "DAY 62",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to touch base and see how you're doing. Everything going well?\"\nVOICEMAIL:\n \"Hope you're doing well. Just staying in touch. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 64",
        "type": "email",
        "subject": "What offers really tell you (beyond price)",
        "body": "#lead_first_name#,\nWhen offers come in, price matters, but it is not the only thing that matters.\nStrong offers also include certainty. How solid the financing is. How clean the terms are. How reasonable the timeline is. How likely the deal is to make it to closing without unnecessary stress.\nSometimes the best offer is not the highest one. It is the one that is most likely to close smoothly.\nWhen that time comes, I will walk you through the full picture in plain language so you can choose confidently.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 67",
        "type": "text",
        "subject": "",
        "body": "Certainty matters. A clean offer that closes smoothly often beats a shaky offer that looks higher on paper."
      },
      {
        "day": "DAY 69",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope everything's going well. Just wanted to check in and see how you're doing.\"\nVOICEMAIL:\n \"Just checking in to see how you're doing. Call me when you have time at [Your Number].\""

      },
      {
        "day": "DAY 71",
        "type": "email",
        "subject": "How my client turned a problem into leverage",
        "body": "Hey #lead_first_name#,\nLet me tell you about a client I had last year.\nThey had a known issue in the home. Something a buyer would definitely notice during inspection.\nInstead of hoping it would not come up, we got ahead of it.\nWe clarified the facts, set expectations early, and used transparency as a strategy. Buyers trust a home more when nothing feels hidden.\nThe result was fewer surprises, less negotiation drama, and a smoother path to closing.\nOwning the issue is not weakness. It is smart positioning.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 74",
        "type": "text",
        "subject": "",
        "body": "Owning the problem before buyers find it is strategy, not weakness. It keeps the deal calmer later."
      },
      {
        "day": "DAY 76",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to see how you're doing. Everything good on your end?\"\nVOICEMAIL:\n \"Hope everything's good. Just staying in touch. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 78",
        "type": "email",
        "subject": "What most agents won't say out loud",
        "body": "#lead_first_name#,\nHere's what I believe.\nSelling well takes clarity, preparation, and the right plan. It is not just putting a sign in the yard and hoping for the best.\nIt also means being honest about what the market will pay, what buyers will notice, and what needs to happen before you list so you are not scrambling.\nSome agents avoid those conversations because it is easier to say what sounds good.\nBut our job is to guide you well. That means telling the truth early so the process feels smoother later.\nWhen you are ready, you will get a clear plan and real guidance from me, with steady support through every step.\nWe will get to the finish line, and we will do it calmly.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 81",
        "type": "text",
        "subject": "",
        "body": "I will always give you the real plan, not just the easy answer. That is how we keep things smooth."
      },
      {
        "day": "DAY 83",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#. Just wanted to check in and see how everything's going. You doing well?\"\nVOICEMAIL:\n \"Hope you're doing well. Just staying in touch. Call me back at [Your Number].\""

      }
    ]
  },
  "buyer-watch": {
    "name": "WATCH BUYER LEAD CAMPAIGN (3-6 MONTHS OUT)",
    "notes": "6-Month Follow-Up System\nBi-Weekly Touches: 1 Email - 1 Text - 1 Call Every 2 Weeks\nTHE APPROACH:\nThese buyers are building their strategy. Help them gain market knowledge, prepare financially, understand neighborhoods, and position themselves to act decisively when ready. Bi-weekly cadence maintains presence without overwhelming. Different content from HOT sequence to avoid duplication if they switch.\n⚠️ TRANSITION TO HOT: If their timeline accelerates or engagement increases significantly, move them to HOT sequence.\n ⚠️ STOP THE SEQUENCE: When they go under contract. Switch to transaction management and closing coordination.\nCRM AUTOMATION RULES:\n DO NOT pause this campaign when leads respond or engage.\n ONLY pause/remove from campaign if:\nLead explicitly states their timeline has changed and they are no longer buying/selling in this timeframe\nLead has listed/gone under contract with another agent\nLead requests to stop receiving communications\nLead converts to active client and enters your active workflow\nIf lead responds with questions, interest, or engagement: Keep them in campaign AND respond personally. Automated touches continue.\nAfter the final touch, wait 30 days. If no activity, update stage/status to COLD and trigger the COLD DRIP CAMPAIGN.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "What smart buyers are doing right now",
        "body": "Hey #lead_first_name#,\nA lot of buyers start with Zillow and then feel overwhelmed fast. That's normal.\nThe buyers who end up feeling confident usually do something different. They build their strategy before they try to move quickly.\nThat looks like:\n Learning what areas actually fit your life\n Watching patterns without obsessing\n Getting clear on must-haves vs nice-to-haves\n Having a lender conversation early\n Understanding what \"ready\" actually means for you\nSo when the right house shows up, you're not trying to figure everything out on the fly. You already know what matters.\nHere's what we'll focus on together: clarity, preparation, and a plan that fits your timeline.\nIf you want to start mapping that out, just reply. We can keep it simple.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 7",
        "type": "text",
        "subject": "",
        "body": "Start paying attention to what catches your eye when you drive around. The neighborhoods that feel right. The homes that make you slow down. That tells you more than you think."
      },
      {
        "day": "DAY 14",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Wanted to start the conversation about what you're actually looking for. Not just specs, but the lifestyle side. That's where the clarity comes from.\"\nVOICEMAIL:\n \"Let's talk about what you want your life to look like, because that determines where we focus. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 17",
        "type": "email",
        "subject": "How to read the market without getting overwhelmed",
        "body": "#lead_first_name#,\nThe market can shift week to week, but you do not need to track every listing to be informed.\nHere's what actually helps you understand what's going on without spiraling:\nHow long homes sit in the areas you like\nWhat price ranges move quickly\nWhere inventory feels tight vs where it feels competitive\nWhen sellers are negotiating and what that looks like\nWhich homes feel like outliers and why\nThat's the rhythm of the market.\nI keep an eye on this daily so you don't have to. When you're ready to move, you'll have a clear picture of what's happening, not just what it feels like from scrolling online.\nIf you want a snapshot for the specific areas you're watching, tell me what they are and I'll share what I'm seeing.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 21",
        "type": "text",
        "subject": "",
        "body": "Quick question. If you could only have 3 things in your next place, what would they be? Your gut answer matters."
      },
      {
        "day": "DAY 28",
        "type": "call",
        "subject": "",
        "body": "\"Hey! I've got some helpful market insight on areas you might like. Want to hear what I'm seeing?\"\nVOICEMAIL:\n \"Got a quick market update that could be useful. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 31",
        "type": "email",
        "subject": "The prep work that actually matters",
        "body": "Hey #lead_first_name#,\nMost buyers skip the foundation work and jump straight to touring homes.\nThen when the right house appears, they're scrambling to confirm budget, talk to a lender, and make decisions under pressure.\nHere's the calmer approach that tends to work better:\nGet your finances dialed in.\n Talk to a lender early. Know your real number, not a guess. Understand closing costs and what monthly payment feels comfortable.\nDrive neighborhoods at different times.\n Saturday morning feels different than Tuesday at 5pm. Notice traffic, noise, energy, and how it feels to be there.\nGet clear on your non-negotiables.\n Write down what you must have and what you can flex on. This makes decisions so much easier later.\nTalk to people who live where you want to live.\n They'll tell you what the internet can't. Parking, HOA realities, noise, and what day-to-day life is actually like.\nYou don't have to do all of this at once. But doing some of it now makes everything easier when you're ready to act.\nIf you want help with any of it, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 38",
        "type": "text",
        "subject": "",
        "body": "Have you talked to a lender yet? Knowing your real budget changes everything about how you look at homes."
      },
      {
        "day": "DAY 40",
        "type": "call",
        "subject": "",
        "body": "\"Quick question. As you've been thinking about this, what's becoming clearer? Sometimes priorities shift as you start paying attention.\"\nVOICEMAIL:\n \"Just wanted to check in on what matters most to you right now. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 43",
        "type": "email",
        "subject": "The neighborhoods people are paying attention to right now",
        "body": "#lead_first_name#,\nOne thing that helps buyers feel confident is understanding where energy is building, not just where it's already expensive.\nHere are a few types of areas that often create opportunity:\nThe \"quietly improving\" neighborhood\n The one where local businesses are opening, streets feel cared for, and buyers are starting to notice, but it still feels accessible.\nThe \"stable and solid\" neighborhood\n Not flashy, but dependable. Buyers move there for lifestyle, schools, space, or simplicity and they tend to stay.\nThe \"next chapter\" neighborhood\n The area with planned improvements, updated parks, new development, or fresh momentum that usually shows up before prices catch up.\nThe goal isn't to chase what's already hot. The goal is to understand what fits your life and recognize value early.\nIf you want to talk through neighborhoods that match what you're looking for, reply and tell me what you're drawn to. I'll help you narrow it down.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 49",
        "type": "text",
        "subject": "",
        "body": "Those neighborhood ideas. Start paying attention to what's selling there and how fast. The pattern tells you a lot."
      },
      {
        "day": "DAY 56",
        "type": "call",
        "subject": "",
        "body": "\"Hey! I've been thinking about areas that might fit what you're looking for. Want to talk through a few options?\"\nVOICEMAIL:\n \"I have a couple neighborhood ideas worth discussing. Call me when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 60",
        "type": "email",
        "subject": "How to know when a house is actually the right fit",
        "body": "Hey #lead_first_name#,\nMost buyers second-guess everything. They like a house, then the spiral starts.\nWhat if something better shows up next week?\n What if we're settling?\n What if we're making a mistake?\nHere's the truth. There's no perfect house.\nEvery home is a tradeoff. The one with the perfect kitchen might have a smaller yard. The one with the best location might need updates. The one with all the space might come with a longer commute.\nSo instead of looking for perfect, look for \"works.\"\nHere's a framework that helps:\n Does it meet about 80% of your must-haves?\n Do the remaining compromises feel livable, not heavy?\n Does it fit your budget comfortably?\n Can you picture your real life there, not an ideal version?\nThe homes people regret passing on usually had what mattered most. They just kept waiting for flawless.\nThe homes people regret buying usually had red flags they talked themselves out of.\nMy goal is to help you stay grounded in what matters, so when the right fit appears, you can feel confident about your decision.\nIf you ever want to talk through what \"right\" looks like for you, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 65",
        "type": "text",
        "subject": "",
        "body": "The buyers who wait for the perfect house usually keep waiting. The buyers who recognize a really good fit get to move forward."
      },
      {
        "day": "DAY 70",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Just checking in. Are you seeing anything close to what you want, or does everything feel like it's missing something?\"\nVOICEMAIL:\n \"Just checking in on your search. Hope everything's good. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 74",
        "type": "email",
        "subject": "How [Client Name] built their strategy (and why it worked)",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey didn't rush. They used the early stage to get clear.\nThey drove neighborhoods. Talked to a lender early. Made a real must-have list. Watched the market without obsessing. Built their knowledge so decisions felt easier later.\nThen when the right home showed up, they recognized it quickly. They didn't panic. They didn't second-guess. They moved with confidence.\nThat's the benefit of strategy-building. It turns uncertainty into clarity.\n[Client] said: \"[Testimonial]\"\nIf you want help building your version of that plan, just reply. We can keep it light and step-by-step.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 78",
        "type": "call",
        "subject": "",
        "body": "\"Quick check-in. What's becoming clearer as you think about all this? And what still feels fuzzy?\"\nVOICEMAIL:\n \"Want to know where you have clarity and where you need support. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 84",
        "type": "text",
        "subject": "",
        "body": "That story about strategic prep is the approach that wins. Knowledge before action. If you want help building that foundation, I'm here."
      },
      {
        "day": "DAY 85",
        "type": "email",
        "subject": "The mistake that costs buyers money later",
        "body": "Hey #lead_first_name#,\nI see this all the time.\nBuyers fall in love during the showing and miss the expensive problems.\nThey notice the renovated kitchen, but not the aging roof.\n They love the yard, but don't realize the HOA is restrictive or pricey.\n They get excited about the layout, but don't ask about systems or maintenance.\nHere's the thing. You're not supposed to catch every issue. That's part of what we're here for.\nWhen I walk a home with clients, I'm watching for the things that affect your wallet and your day-to-day life. Not just the pretty parts.\nThat's protection. It's not fear-based. It's simply making sure you know what you're buying before you commit.\nIf you want that level of coverage as you start touring, let me know.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 91",
        "type": "text",
        "subject": "",
        "body": "When you tour homes, do you have someone with you who can spot problems? It makes a bigger difference than most people realize."
      },
      {
        "day": "DAY 98",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Wanted to talk about what to actually look for when you're touring homes, the stuff most people miss.\"\nVOICEMAIL:\n \"Let's talk about spotting issues before they become your issues. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 101",
        "type": "email",
        "subject": "Where your weekends will actually happen",
        "body": "#lead_first_name#,\nHere's what nobody tells you.\nYou're not just choosing a house. You're choosing how your Saturdays will feel.\nAre you walking to coffee?\n Are you driving everywhere?\n Do you want quiet and space, or energy and community?\n Do you want neighbors nearby, or more privacy?\nLocation shapes lifestyle.\nMost buyers choose the house and hope the life works out.\nThe calmer approach is choosing the life first, then finding the home that supports it.\nIf you tell me what you want your days to feel like, I can help you focus on neighborhoods that match that.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 109",
        "type": "text",
        "subject": "",
        "body": "That weekend lifestyle question is the real one. What do you want your Saturdays to feel like?"
      },
      {
        "day": "DAY 112",
        "type": "call",
        "subject": "",
        "body": "\"Quick question. What wins for you right now, walkability or space? It's hard to get both, so I'm curious which matters more.\"\nVOICEMAIL:\n \"Trying to understand your priorities so we focus well. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 115",
        "type": "email",
        "subject": "The local spots that make [Area] feel like home",
        "body": "Hey #lead_first_name#,\nYou're not just buying a home. You're buying into a community.\nHere's what [Area] offers beyond the houses:\n[Local Business 1] [Why it matters]\n [Community Space] [The vibe]\n [Local Business 2] [What's special]\n [Local Business 3] [Why you'll love it]\nThis is why the \"life\" part matters so much. The home gives you access to everything around it.\nIf you tell me a few areas you're drawn to, I'm happy to share what life looks like there day-to-day.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 119",
        "type": "text",
        "subject": "",
        "body": "Random thought. Do you want to be able to walk places, or are you fine driving everywhere? That determines which neighborhoods make sense."
      },
      {
        "day": "DAY 126",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That community email, does that kind of vibe appeal to you, or are you looking for something different?\"\nVOICEMAIL:\n \"Want to talk about lifestyle fit and community. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 133",
        "type": "email",
        "subject": "The opportunities most buyers overlook",
        "body": "#lead_first_name#,\nA lot of buyers focus only on the most polished homes.\nMove-in ready. Perfect photos. Fresh updates.\nAnd those homes often come with the most competition.\nSometimes the better opportunities are the homes that need cosmetic work, are priced slightly high, or simply weren't marketed well.\nNot bad homes. Just overlooked ones.\nThat's where leverage can show up.\nMy job is to help you see what's worth considering, what's not, and where a smart strategy could create a better outcome.\nIf you want help spotting those opportunities, I'm here.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 135",
        "type": "call",
        "subject": "",
        "body": "\"Quick check-in. Are you seeing things that feel right, or does everything feel like it's almost right but not quite?\"\nVOICEMAIL:\n \"Want to hear what you're finding and what feels missing. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 140",
        "type": "text",
        "subject": "",
        "body": "Question. Are you looking for move-in ready, or are you open to a place with potential? That answer changes the strategy."
      },
      {
        "day": "DAY 143",
        "type": "email",
        "subject": "The questions you should ask during showings",
        "body": "Hey #lead_first_name#,\nMost buyers notice the pretty details first. That's normal.\nBut the smartest buyers ask questions about the parts you can't see right away.\nA few worth keeping in your back pocket:\nWhen was the roof replaced?\n How old is the HVAC and water heater?\n Has there ever been water intrusion or flooding?\n What are the typical utility costs?\n Why is the seller moving?\n What's included and what's excluded from the sale?\nPretty is easy to change. Big systems and water issues are not.\nIf you ever want a simple \"showing checklist\" to use while you tour, reply and I'll send it.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 149",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Just wanted to check in and see how things are going. Anything interesting out there?\"\nVOICEMAIL:\n \"Just checking in. Hope everything's good. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 154",
        "type": "text",
        "subject": "",
        "body": "Buyers who ask the hard questions during showings avoid expensive surprises later. Pretty kitchens are fun. Dry basements and solid systems matter more."
      },
      {
        "day": "DAY 157",
        "type": "email",
        "subject": "What I'm seeing right now (in a grounded way)",
        "body": "#lead_first_name#,\nHere's a grounded take on what I'm seeing.\nGood homes in good locations still move. They may not fly off the shelf the way they did in the peak frenzy, but they don't sit forever either.\nHomes that sit longer usually have one of three issues: price, condition, or location.\nWhat this means for you is actually helpful.\nYou can be selective. You can negotiate more than you could in the past. But when the right home appears, it still pays to move with intention.\nIf you want, tell me the areas and price range you're watching and I'll share what the current pace looks like there.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 160",
        "type": "text",
        "subject": "",
        "body": "Market note: good homes are still moving, but there's more room to negotiate than there was. Being thoughtful works in your favor."
      },
      {
        "day": "DAY 165",
        "type": "call",
        "subject": "",
        "body": "\"Quick question. What's the one thing you're waiting to see before you'd feel ready to move forward?\"\nVOICEMAIL:\n \"Trying to understand what you need so I can help you find it. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 169",
        "type": "email",
        "subject": "Why I'm careful about who I recommend",
        "body": "#lead_first_name#,\nI get asked all the time, \"Who should I use for a lender, inspector, contractor, or title?\"\nHere's how I handle that.\nI recommend people based on performance, not popularity.\nThe professionals I refer have earned trust by being consistent. They communicate. They follow through. They protect the process. They do what they say they'll do.\nThat matters because the wrong lender can create last-minute stress. The wrong inspector can miss something costly. The wrong contractor can leave you in a half-finished mess.\nYou can absolutely use whoever you'd like. But if you want a short list of people we trust, I'm happy to share it anytime.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 175",
        "type": "text",
        "subject": "",
        "body": "The lender and inspector recommendations I share aren't random. They've earned it by keeping deals smooth and clients protected."
      },
      {
        "day": "DAY 182",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just checking in. Everything going well on your end?\"\nVOICEMAIL:\n \"Just checking in. Hope you're doing well. Call me back when you can at [Your Number].\""

      }
    ]
  },
  "seller-watch": {
    "name": "WATCH SELLER LEAD CAMPAIGN (3-6 MONTHS OUT)",
    "notes": "26-Week (6-Month) Follow-Up System\nBi-Weekly Touches: 1 Email - 1 Text - 1 Call Every 2 Weeks\nTHE APPROACH:\n Tactical preparation for sellers. Focus on competitive positioning, pricing strategy, market data interpretation, and execution details.\n ⚠️ TRANSITION TO PRE-LISTING: When they commit to listing, move to pre-listing workflow with walkthrough, pricing, and tactical preparation.\nCRM AUTOMATION RULES:\n DO NOT pause this campaign when leads respond or engage.\n ONLY pause/remove from campaign if:\nLead explicitly states their timeline has changed and they are no longer buying/selling in this timeframe\nLead has listed/gone under contract with another agent\nLead requests to stop receiving communications\nLead converts to active client and enters your active buyer/seller workflow\n If lead responds with questions, interest, or engagement: Keep them in campaign AND respond personally. Automated touches continue.\nAfter the final touch, wait 30 days. If no activity, update stage/status to COLD and trigger the COLD DRIP CAMPAIGN.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "The 3 things that determine what your house actually sells for",
        "body": "Hey #lead_first_name#,\nMost homeowners have a number in their head.\nAnd sometimes that number is close. Sometimes it's not. Either way, the final sale price usually comes down to three things:\n1. What comparable homes have SOLD for recently.\n Not listed for. Sold for. That's the real story. A home can list at $500K, but if it closes at $475K, the closing price is what matters.\n2. How much competition you have in your price range.\n If there are a lot of homes for sale and only a few selling, buyers have options and you'll feel it in negotiations. If inventory is tight, strong homes stand out and sell with more leverage.\n3. How your home compares to what buyers are seeing right now.\n Buyers are always comparing. Condition, location, presentation, price. If your home feels like the best value, it wins attention. If it feels like work or feels overpriced compared to the alternatives, it sits.\nThese three factors determine the outcome more than what you paid, what you need, or what an online estimate says.\nIf you want, we can look at where your home fits in these categories and map out a smart plan from there. Just reply anytime.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 7",
        "type": "text",
        "subject": "",
        "body": "Drive around and look at the For Sale signs in your neighborhood. Count them. More inventory means more competition. Fewer listings usually means a stronger position for sellers."
      },
      {
        "day": "DAY 14",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Wanted to talk about how your home compares to what's actively for sale right now. That comparison matters more than most people realize.\"\nVOICEMAIL:\n \"Just wanted to talk through your home's position in the current market and what that could mean for you. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 15",
        "type": "email",
        "subject": "The showings to offer ratio (and what it tells you)",
        "body": "#lead_first_name#,\nHere's something sellers don't always realize until they're in it:\nShowings are feedback.\nAnd the pattern of showings tells you quickly whether your pricing and presentation are landing.\nA simple way to think about it:\nStrong showing activity, no offers usually means you're close, but something is slightly off. Often price, sometimes presentation.\nLow showing activity is almost always a visibility or value issue, buyers aren't choosing it.\nHigh showing activity and offers means the market sees it as a strong value, and you've created momentum.\nThe first two weeks tell you a lot. And if you know how to read the signals early, you can adjust before the listing gets stale.\nMost agents list and hope. We pay attention, interpret the feedback, and stay proactive.\nIf you want to walk through what this could look like for your home, just tell me what neighborhood you're in and we can talk strategy.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 21",
        "type": "text",
        "subject": "",
        "body": "Quick question: do you know what the last few homes sold for on your street or nearby? Closed prices are the real baseline."
      },
      {
        "day": "DAY 28",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Wanted to talk through pricing strategy and how we'd know quickly if we nailed it. The market gives feedback fast.\"\nVOICEMAIL:\n \"Happy to walk you through how to read market feedback once a home goes live. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 30",
        "type": "email",
        "subject": "Why some homes get multiple offers and others sit",
        "body": "Hey #lead_first_name#,\nTwo homes can be similar in size and style, even on the same street.\nOne gets strong activity and offers right away. The other sits.\nThe difference is almost never luck. It's usually execution.\nThe home that moves quickly tends to have:\n Pricing that feels like a good value in the current market\n Photos that make people want to see it in person\n A clean, bright, cared-for feel\n Easy showing access so buyers can say yes\n A launch plan that creates early momentum\nThe home that sits often has:\n A price that's built on hope instead of strategy\n Photos that don't do it justice\n Clutter, odors, or deferred maintenance showing up in the experience\n Limited showing availability\n A \"we'll see what happens\" approach\nThe good news is this: most of it is fixable with the right plan.\nIf you want a clear, low-stress way to think about prep vs pricing vs selling as-is, I'm happy to talk it through.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 35",
        "type": "text",
        "subject": "",
        "body": "That difference between multiple offers and sitting usually comes down to preparation, pricing, and presentation. Same home, different execution."
      },
      {
        "day": "DAY 42",
        "type": "call",
        "subject": "",
        "body": "\"Quick question: have you thought about whether you'd fix things before listing or price accordingly and sell as-is?\"\nVOICEMAIL:\n \"Happy to talk through the as-is versus fix-it-first decision and what tends to work best. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 43",
        "type": "email",
        "subject": "The truth about pricing (and why honesty matters)",
        "body": "#lead_first_name#,\nHere's one thing we're always honest about:\nPricing isn't just a number. It's a strategy.\nAnd the wrong strategy costs sellers time, stress, and often money.\nSome agents lead with the number that feels good. It gets them the listing. But it doesn't always get the home sold the way the seller hoped.\nWe do it differently.\nWe'd rather start with the real plan based on what buyers are actually doing and what your home is competing against, then build the execution around that.\nWhen a home is priced and positioned well from day one, everything gets easier. More traffic. Better leverage. Cleaner negotiations.\nIf you ever want a straightforward conversation about what pricing strategy would look like for your home, we're here.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 49",
        "type": "text",
        "subject": "",
        "body": "There are times we'll say \"no\" to a plan that we know will set you up to sit. We'd rather protect you than promise something unrealistic."
      },
      {
        "day": "DAY 56",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Want to talk about what buyers in your price range are prioritizing right now? It's helpful for planning.\"\nVOICEMAIL:\n \"Happy to share what buyers tend to care about most at your price point and how that affects prep and strategy. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 57",
        "type": "email",
        "subject": "Where sellers waste money (and where it actually pays off)",
        "body": "Hey #lead_first_name#,\nIf you're thinking about selling in the next few months, this matters:\nSome upgrades feel productive, but don't change your sale price much. Others are simple and create a big return because they change how buyers experience the home.\nIn most cases, what pays off tends to be:\n Fresh, neutral paint\n Deep cleaning\n Decluttering\n Small repairs that signal \"this home is cared for\"\n Simple curb appeal basics\nWhat often doesn't return what people expect:\n Big, taste-specific upgrades\n Over-customization\n Projects that over-improve beyond what your neighborhood supports\nThe goal isn't to make your home perfect. It's to make it feel clean, cared for, and easy to say yes to.\nIf you want, we can talk through what's worth doing for your home specifically and what you can skip.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 63",
        "type": "text",
        "subject": "",
        "body": "The sellers who do best usually fix what's broken, clean it up, and keep it simple. Over-improving is rarely the move."
      },
      {
        "day": "DAY 70",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Just checking in. How's everything going?\"\nVOICEMAIL:\n \"Just checking in. Hope you're doing well. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 72",
        "type": "email",
        "subject": "How [Client Name] avoided a painful price reduction",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey were preparing to sell, but the home needed a refresh. Nothing major, but enough that buyers would notice.\nWe talked through two paths:\n List as-is and price more conservatively\n Or make a small, strategic investment to improve the first impression and protect the price point\nThey chose the strategic refresh.\n[What happened. Example: \"Fresh paint, new carpet or flooring where needed, a deep clean, and small fixes.\"]\nThe result was simple: the home showed better, photographed better, and created more confidence with buyers. That reduced negotiation pressure and helped them avoid the slow slide of \"price reductions because the listing sat.\"\n[Client] said: \"[Testimonial]\"\nIf you want, we can talk through what \"strategic prep\" would look like for your home, without it becoming a giant project.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 80",
        "type": "text",
        "subject": "",
        "body": "That client story is a great reminder: sometimes a small strategic refresh protects a much bigger number later."
      },
      {
        "day": "DAY 82",
        "type": "call",
        "subject": "",
        "body": "\"Quick check-in. What's becoming clearer as you think about this, and what questions are still sitting with you?\"\nVOICEMAIL:\n \"Just want to know what you're thinking and where you'd like support. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 85",
        "type": "email",
        "subject": "Does season matter, or is that a myth?",
        "body": "Hey #lead_first_name#,\nPeople love to ask: when is the best time to sell?\nSeason can influence activity, but it's not the whole story.\nSpring often brings more buyers, but also more competition.\n Summer can still be active, especially for people who need to move.\n Fall can be quieter, but serious buyers remain, and inventory is often lower.\n Winter is slower, but the buyers who are out are usually motivated.\nWhat matters more than the month on the calendar:\n Pricing strategy\n Presentation and condition\n How your home compares to what else is available\n A clear plan for showings and logistics\nA well-positioned home can sell in any season. A poorly positioned home can sit in the \"best\" season.\nIf you want to talk through what timing would serve you best based on your situation, I'm here.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 91",
        "type": "text",
        "subject": "",
        "body": "Season matters a little. Strategy matters a lot. Homes that are priced and presented well can sell year-round."
      },
      {
        "day": "DAY 98",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Wanted to talk timing, whether now makes sense, or whether waiting actually serves you better.\"\nVOICEMAIL:\n \"Happy to talk timing strategy whenever you want. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 101",
        "type": "email",
        "subject": "Photos matter more than most sellers think",
        "body": "#lead_first_name#,\nYour listing photos are your first showing.\nMost buyers decide whether they want to see a home in person based on photos alone. If the photos don't tell the story well, the home gets skipped, even if it's great.\nProfessional photography helps because it:\n Shows space accurately\n Highlights natural light\n Captures flow and layout\n Makes the home feel clean, bright, and inviting\nThe goal is not to \"fake\" anything. It's simply to make sure the home is represented well online, because that's where the decision to tour starts.\nIf you ever want to talk through what would photograph best in your home and what to adjust beforehand, I can walk you through it.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 108",
        "type": "text",
        "subject": "",
        "body": "Your photos are your first showing. If the photos fall flat, the showings do too."
      },
      {
        "day": "DAY 112",
        "type": "call",
        "subject": "",
        "body": "\"Quick question: if you sold, where would you go next? That helps us plan timing and strategy in a way that feels steady.\"\nVOICEMAIL:\n \"Trying to understand your next step so we can plan well. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 115",
        "type": "email",
        "subject": "Pre-listing inspections: when they help and why",
        "body": "Hey #lead_first_name#,\nOne strategy we sometimes recommend is a pre-listing inspection.\nNot always. But when it's the right fit, it can reduce surprises and keep negotiations cleaner.\nHere's why it helps:\n You learn about issues before a buyer does\n You can fix what makes sense or price accordingly\n You control the narrative with transparency\n You avoid last-minute negotiation chaos that can derail a deal\nWithout it, sellers sometimes find out about problems mid-transaction and have to make pressured decisions quickly.\nIf you want, we can talk about whether a pre-inspection makes sense for your home and your timeline.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 126",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That pre-inspection email, want to talk about whether that would make sense for your situation?\"\nVOICEMAIL:\n \"Happy to walk through the pros and cons for your home specifically. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 128",
        "type": "email",
        "subject": "The part of this job that matters most",
        "body": "#lead_first_name#,\nA lot of people think real estate is about houses.\nIt's not.\nIt's about helping people move through change with as much clarity and calm as possible.\nSometimes it's a new chapter and it feels exciting. Sometimes it's a tough season and it feels heavy. Either way, the goal is the same: build a plan that protects you and gets you where you need to go.\nIf selling is on your horizon, even vaguely, it's okay if you don't have it all figured out yet. That's what we're here for.\nWhenever you want to talk it through, I'm here.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 135",
        "type": "text",
        "subject": "",
        "body": "Real estate is rarely just a transaction. It's usually a life moment. That's why planning ahead matters."
      },
      {
        "day": "DAY 140",
        "type": "call",
        "subject": "",
        "body": "\"Quick check-in. How's everything going? Are you getting closer to a decision, or still in the thinking phase?\"\nVOICEMAIL:\n \"Just checking in on where you're at with everything. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 147",
        "type": "email",
        "subject": "How [Client Name] stood out, even with competition",
        "body": "Hey #lead_first_name#,\nLet me tell you about [Client Name].\nThey had competition. Similar homes nearby. Buyers had options.\nSo we focused on one thing: standing out.\nThat meant:\n A price that created confidence\n A home that felt clean, bright, and cared for\n Photos that made people want to see it\n A showing plan that made it easy for buyers\n A launch that built early momentum\nThe result: strong activity early, clean negotiations, and a smoother path to closing.\n[Client] said: \"[Testimonial]\"\nIf you want, we can talk through what \"standing out\" would look like for your home, without making it complicated.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 150",
        "type": "text",
        "subject": "",
        "body": "If you had the real number and it was lower than you hoped, would you still sell? That question often clarifies everything."
      },
      {
        "day": "DAY 154",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Want to talk about how we'd position your home to stand out if you decided to list?\"\nVOICEMAIL:\n \"Happy to talk competitive positioning and what would matter most for your home. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 158",
        "type": "email",
        "subject": "The thing about your home you can't see anymore",
        "body": "#lead_first_name#,\nWhen you've lived in a home for a while, you stop seeing it the way a buyer sees it.\nYou see the memories. The routines. The meaning.\nBuyers walk in with fresh eyes and notice different things: light, smell, clutter, maintenance, condition, and how it feels in the first minute.\nThis gap is normal. It's also why a thoughtful pre-listing plan matters.\nOne of the most helpful exercises is to walk through your home like a buyer would. If you want, I can give you a simple checklist that helps you do that without turning it into a huge project.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 168",
        "type": "text",
        "subject": "",
        "body": "Selling often comes down to first impressions. Fresh eyes notice things we stop seeing. A simple walkthrough can be eye-opening."
      },
      {
        "day": "DAY 170",
        "type": "call",
        "subject": "",
        "body": "\"Quick question: what would need to happen for you to actually list? Timing, life, a plan for what's next? Just curious.\"\nVOICEMAIL:\n \"Just trying to understand what you're waiting for so I can support you well. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 172",
        "type": "email",
        "subject": "The conversation we have with every seller",
        "body": "#lead_first_name#,\nEvery seller we work with gets a clear conversation up front.\nNot to be intense. Just to be honest and protect you.\nIt's about aligning on three things:\n What the market is likely to support\n What your goals are\n What strategy will actually get you there\nBecause there are two kinds of plans:\n A plan that sounds good\n A plan that works\nOur job is to build the plan that works, then execute it with care.\nIf you ever want to talk through what that would look like for your home, even if you're months out, I'm here.\n#agent_sending_email#\n #agent_phone#"
      },
      {
        "day": "DAY 178",
        "type": "text",
        "subject": "",
        "body": "We'll always give you the truth and a plan. Not pressure. Not guesswork. Just clarity."
      },
      {
        "day": "DAY 180",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to check in and see how you're doing. How's everything going?\"\nVOICEMAIL:\n \"Just checking in. Hope you're doing well. Call me back when you can at [Your Number].\""

      }
    ]
  },
  "buyer-nurture": {
    "name": "WARM/NURTURE BUYER CAMPAIGN (6+ MONTHS OUT)",
    "notes": "12-Month Long-Term Follow-Up System\nMonthly Touches: 1 Email - 1 Text - 1 Call Per Month\nTHE APPROACH:\n Long-term relationship building for buyers who are further out or not committed to a timeline. Monthly touches keep you top of mind without overwhelming. Focus on education, market intelligence, community knowledge, and trust.\n⚠️ TRANSITION TO WATCH OR HOT: If their timeline accelerates or engagement increases, move them to WATCH or HOT sequence.\n ⚠️ STOP THE SEQUENCE: When they go under contract. Switch to transaction management and closing coordination.\nCRM AUTOMATION RULES:\n DO NOT pause this campaign when leads respond or engage.\n ONLY pause/remove from campaign if:\nLead explicitly states their timeline has changed and they are no longer buying/selling in this timeframe\nLead has listed/gone under contract with another agent\nLead requests to stop receiving communications\nLead converts to active client and enters your active workflow\nIf lead responds with questions, interest, or engagement: Keep them in campaign AND respond personally. Automated touches continue.\nAfter the final touch, wait 30 days. If no activity, update stage/status to COLD and trigger the COLD DRIP CAMPAIGN.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "What I wish someone had told me before I bought my first house",
        "body": "Hey #lead_first_name#,\nLet me tell you about my first home purchase.\nI thought I knew what I was doing. I didn't.\nI focused on the pretty stuff. The finishes, the kitchen, the way it looked in the moment. I didn't think hard enough about the things that actually shape daily life. The layout you live in. The street noise you hear every day. The commute that slowly becomes exhausting. The systems you end up replacing sooner than you expected.\nHere's what I learned the hard way.\nThe house you buy determines the life you live.\nNot just the space inside, but the routines around it. Where you spend your time. How much energy it takes to get through your week. Whether you feel connected to where you live or constantly on the go.\nThat's why I do this now. To help people avoid expensive stress and make a decision they still feel good about years from now.\nMy job is not to sell you a house. It's to help you buy the right fit for your life.\nIf you ever want to start that conversation, reply anytime. We can keep it simple and take it one step at a time.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 15",
        "type": "text",
        "subject": "",
        "body": "Quick thought. When you picture yourself in a new place, what does a perfect Saturday look like? That answer tells you more than any house specs."
      },
      {
        "day": "DAY 28",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to check in and see how you're doing. No agenda, just staying in touch. How's everything going?\"\nVOICEMAIL:\n \"Just a friendly check in. Hope you're doing well. Call me back if you want to chat at [Your Number].\""

      },
      {
        "day": "DAY 30",
        "type": "email",
        "subject": "Why I'm selective about who I recommend",
        "body": "#lead_first_name#,\nI have the same conversation all the time.\nPeople ask, \"Who should I use for a lender, inspector, title, contractor?\"\nHere's the honest answer. I'm selective.\nNot because I think there's only one good option in the world, but because I take protecting your experience seriously.\nThe people I recommend are the ones who consistently show up, communicate clearly, and do what they say they will do. They don't create last minute chaos. They don't leave things half finished. They don't disappear when you need answers.\nThat matters more than most people realize.\nA bad lender can create unnecessary stress. A rushed inspector can miss something important. A flaky contractor can derail your momentum and your budget.\nWhen you work with me, you get access to a team that makes the process smoother. The goal is a calm, clear path to the finish line, not a bunch of avoidable fires along the way.\nIf you ever want recommendations, just ask. I'm happy to connect you.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 45",
        "type": "text",
        "subject": "",
        "body": "Random question. What's more important to you, being close to work or being in a neighborhood you love? Most people have to choose."
      },
      {
        "day": "DAY 58",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Wanted to see if real estate has been on your mind at all, or if it's on the back burner right now.\"\nVOICEMAIL:\n \"Just checking in. Call me back when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 60",
        "type": "email",
        "subject": "The real cost of buying the wrong house",
        "body": "Hey #lead_first_name#,\nI worked with someone a few years ago who bought the wrong house.\nThey loved it during the showing. The kitchen was beautiful. The backyard felt like a dream. They minimized the things that seemed small in the moment.\nSix months later, they hated living there.\nThe noise that seemed manageable became exhausting. The commute that felt fine became draining. The location that felt \"close enough\" started to feel isolating.\nThey ended up selling and starting over, and it cost them time, money, and energy.\nHere's what I learned from watching that.\nThe things that seem minor during a short showing become major when you live with them every day.\nThat's why my job is to keep the focus on the life, not just the house.\nThe house is the container. The life is what matters.\nIf you ever want to talk about what that life looks like for you, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 75",
        "type": "text",
        "subject": "",
        "body": "When you drive around, pay attention to what neighborhoods feel right. Not just look right. Feel right. That gut reaction matters."
      },
      {
        "day": "DAY 88",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to stay in touch. Have you been looking at anything, or just keeping an eye on things?\"\nVOICEMAIL:\n \"Friendly check in. Hope things are good. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 91",
        "type": "email",
        "subject": "What you can actually afford (and why most people guess)",
        "body": "#lead_first_name#,\nMost buyers think they know what they can afford. They're usually guessing.\nA lot of people focus on the mortgage payment and forget the full picture. Taxes, insurance, HOA fees if applicable, utilities, maintenance, and the reality that life still needs room to breathe.\nThe buyers who feel stressed after closing are usually the ones who stretched to the maximum, instead of choosing a payment that leaves them comfortable.\nHere's the rule I share with clients.\nIf the house payment leaves you unable to save, travel, or handle a surprise expense without panic, it's too much house.\nThe bank will often lend more than you should borrow. It's your job to know the difference.\nIf you ever want help running numbers honestly, without pressure, I'll walk you through it. Clarity brings confidence.\n#agent_sending_email#\n#agent_phone#\n[Brokerage]\n[Website]"
      },
      {
        "day": "DAY 105",
        "type": "text",
        "subject": "",
        "body": "Be honest. Do you know your real number with taxes, insurance, HOA, all of it? Most people are guessing."
      },
      {
        "day": "DAY 118",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Just wanted to check in and see how everything's going.\"\nVOICEMAIL:\n \"Just checking in. Hope you're doing well. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 120",
        "type": "email",
        "subject": "How [Client Name] approached their search (and why it worked)",
        "body": "Hey #lead_first_name#,\nI want to tell you about [Client Name].\nThey were not rushing. They were thoughtful. They got clear on priorities and paid attention long enough to recognize a good opportunity when it showed up.\nWhen the right home appeared, they knew. No panic, no second guessing, no spiraling.\nThey were ready because they had done the work up front. They understood their budget, their must haves, and the areas that fit their real life.\nMost people do it backwards. They start touring homes before they're clear, then get overwhelmed.\n[Client Name] got clear first. Then the home was easier to spot.\n[Client] told me: \"[Testimonial Quote]\"\nThat's always the goal. Calm clarity before big decisions.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 135",
        "type": "text",
        "subject": "",
        "body": "If schools matter to you, start paying attention to district boundaries now. They're not always where you think they are."
      },
      {
        "day": "DAY 148",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Checking in. Still thinking about real estate, or is it on hold for now?\"\nVOICEMAIL:\n \"Just staying in touch. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 153",
        "type": "email",
        "subject": "What actually adds value (and what doesn't)",
        "body": "#lead_first_name#,\nA lot of people assume value comes from flashy upgrades.\nSometimes it does, but not in the way most people think.\nWhat really moves the needle long term is location, the condition of big ticket systems, and a layout that functions well in real life.\nRoof, HVAC, foundation, plumbing, electrical. These aren't exciting, but buyers pay for confidence and stability.\nAnd what doesn't always add value the way people expect? Things that are expensive, highly personal, or high maintenance. Some buyers love them, some avoid them entirely.\nAs a buyer, this is helpful to know.\nFocus on fundamentals. Buy good bones in a location you love. Let someone else overpay for flashy.\nIf you want to talk through what matters most for your goals, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 165",
        "type": "text",
        "subject": "",
        "body": "Random thought. Would you rather have a bigger house or a better location? You usually have to choose."
      },
      {
        "day": "DAY 178",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That email about what adds value, did it land? Want to make sure I'm sending useful stuff.\"\nVOICEMAIL:\n \"Hope that last email was helpful. Call me if you have questions at [Your Number].\""

      },
      {
        "day": "DAY 180",
        "type": "email",
        "subject": "What I love about [Area] (and why you should know about it)",
        "body": "Hey #lead_first_name#,\nLet me tell you about [Area].\nA lot of people drive through and make quick assumptions. But if you slow down and actually spend time there, you start to see why people love it.\nIt has the kind of local spots and everyday convenience that make life easier. It feels lived in, not manufactured. The community shows up. People wave. It has its own rhythm.\nThis is often what \"the right neighborhood\" feels like.\nNot perfect. Not trendy for the sake of it. Just a place where life fits.\nIf you ever want to explore [Area] or compare it to other parts of town, I'm happy to walk you through what living there is actually like.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 195",
        "type": "text",
        "subject": "",
        "body": "That email about [Area], I mean it. Some of the best neighborhoods are the ones most people overlook at first."
      },
      {
        "day": "DAY 208",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just checking in to see how you're doing. Still keeping real estate in the back of your mind?\"\nVOICEMAIL:\n \"Hope you're doing well. Call me back when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 217",
        "type": "email",
        "subject": "How [Client Name] used patience as a strategy",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey did not rush. They watched, learned, got pre approved early, and stayed clear on what mattered.\nThen they found a home that had been sitting. Not because it was bad, but because it needed cosmetic updates that scared people off.\nThey saw past the surface. We negotiated smart. They closed with room in the budget to make it their own.\nNow they love it, and they stayed grounded through the entire process.\nWhat [Client] said: \"[Testimonial Quote]\"\nPatience can be leverage when it's paired with preparation.\nIf you ever want to talk about what that looks like for you, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 225",
        "type": "text",
        "subject": "",
        "body": "Quick question. Do you want space or do you want walkability? Hard to get both. Which one wins for you?"
      },
      {
        "day": "DAY 238",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That story about strategic patience is how smart buyers win. Want to talk about how to apply that to your search?\"\nVOICEMAIL:\n \"Let's talk strategy when you're ready. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 240",
        "type": "email",
        "subject": "What makes living in [Market] feel like home",
        "body": "Hey #lead_first_name#,\nYou're not just buying a house in [Market]. You're buying access to a life here.\nIt's the routines. The local places you end up loving. The community events you stumble into. The parks, trails, coffee spots, date night places, and weekend traditions.\nThat's the piece most people don't think about until after they move.\nIf you tell me which areas you're drawn to, I can share what life feels like there, not just what the listings look like.\nBecause the house matters, but the life around it matters just as much.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 255",
        "type": "text",
        "subject": "",
        "body": "When you think about where you want to live, think about where you'll spend time outside the house too. That matters."
      },
      {
        "day": "DAY 268",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Checking in. How's everything going? Still thinking about making a move eventually?\"\nVOICEMAIL:\n \"Hope things are good. Just staying in touch. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 278",
        "type": "email",
        "subject": "What nobody tells you about buying in a changing market",
        "body": "#lead_first_name#,\nMarkets don't move in straight lines. They shift. They pause. They surprise you.\nHere's what matters more than trying to time things perfectly.\nBeing prepared. Knowing your numbers. Staying clear on what you want. Recognizing a strong opportunity when it appears.\nGood homes always have a market. The way they sell changes, but great homes in great locations still move.\nAnd your personal situation matters more than the headlines.\nIf you ever want to talk through whether timing makes sense for you, we can break it down calmly, without pressure.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 285",
        "type": "text",
        "subject": "",
        "body": "Have you talked to a lender yet, even just to understand options? That conversation changes everything."
      },
      {
        "day": "DAY 298",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Sent you that email about market timing. Any questions about whether now makes sense for you?\"\nVOICEMAIL:\n \"Let's talk timing when you're ready. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 300",
        "type": "email",
        "subject": "The question nobody asks (but should)",
        "body": "Hey #lead_first_name#,\nEveryone asks about bedrooms, price, and neighborhoods.\nBut the most important question is this.\nWhat do you want your daily life to feel like?\nBecause the house is just the backdrop. Your life is the actual thing.\nDo you want to walk places or drive everywhere? Do you want quiet or energy? Do you want neighbors and community, or more privacy? Do you want low maintenance, or land and projects?\nThose answers shape where you should actually be looking.\nMy job is to match your real life to the right location and home, not just send listings.\nIf you ever want to talk through it, reply and tell me what you want your days to feel like.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 315",
        "type": "text",
        "subject": "",
        "body": "That question about what you want your life to feel like is the real one. Everything else is just details."
      },
      {
        "day": "DAY 328",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! It's been a while since we first connected. Wanted to check in and see where you're at with everything.\"\nVOICEMAIL:\n \"Checking in after all this time. Hope you're doing well. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 330",
        "type": "email",
        "subject": "How [Client Name] knew it was time (even though they were nervous)",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey had been thinking about buying for a long time. Every month there was a reason to wait. Rates, prices, uncertainty, timing, life.\nThen they got honest about what waiting was costing them. Not just money, but momentum.\nThey ran the numbers, clarified what they wanted, and decided to move forward when they felt ready, not when the market felt perfect.\nThey found a home, got it under contract, and a year later they were grateful they stopped waiting for a perfect moment that never comes.\nHere's what they told me:\n \"Once we decided to move forward, everything felt simpler. We wish we had trusted ourselves sooner.\"\nThere is rarely a perfect time. There is just the time when you are ready to build the next chapter.\nWhen that time comes for you, whether it's soon or next year, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 345",
        "type": "text",
        "subject": "",
        "body": "The buyers who wait for the perfect time usually keep waiting. The buyers who move when it's a good time for their life start building."
      },
      {
        "day": "DAY 358",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to check in and see how you're doing. Everything going well?\"\nVOICEMAIL:\n \"Just checking in to see how you're doing. Hope everything's well. Call me back when you can at [Your Number].\""

      }
    ]
  },
  "seller-nurture": {
    "name": "NURTURE SELLER CAMPAIGN (6+ MONTHS OUT)",
    "notes": "12-Month Long-Term Follow-Up System\nMonthly Touches: 1 Email - 1 Text - 1 Call Per Month\nTHE APPROACH:\n Long-term relationship building for potential sellers. Monthly touches keep you top of mind without overwhelming. Seller-specific content throughout.\n⚠️ TRANSITION TO PRE-LISTING: When they commit to listing, move to pre-listing workflow with walkthrough, pricing, and tactical preparation.\nCRM AUTOMATION RULES:\n DO NOT pause this campaign when leads respond or engage.\n ONLY pause/remove from campaign if:\nLead explicitly states their timeline has changed and they are no longer buying/selling in this timeframe\nLead has listed/gone under contract with another agent\nLead requests to stop receiving communications\nLead converts to active client and enters your active workflow\nIf lead responds with questions, interest, or engagement: Keep them in campaign AND respond personally. Automated touches continue.\nAfter the final touch, wait 30 days. If no activity, update stage/status to COLD and trigger the COLD DRIP CAMPAIGN.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "What your house is actually worth (and why Zillow is often off)",
        "body": "Hey #lead_first_name#,\nYou've probably checked your home value on Zillow. Everyone does.\nAnd sometimes it's close. Sometimes it's not.\nThe thing is, Zillow doesn't know your house. It can't see the updates you've made, the way your home shows in person, the lot, the street, the layout, or the little details that buyers absolutely notice.\nYour home's value is shaped by what buyers are paying for similar homes right now. Not last year. Not an estimate. Real buyer behavior in today's market.\nI track sales in [Market] consistently, and I keep an eye on what's selling quickly, what's sitting, and what buyers are responding to.\nIf you're curious what your home could realistically sell for, I'm happy to run a true market analysis. No pressure, just clarity.\nIf you want the number, reply and I'll take care of it.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 15",
        "type": "text",
        "subject": "",
        "body": "Quick question. Have you ever thought about what you'd do if your home was worth more than you expected? Sometimes knowing the number changes everything."
      },
      {
        "day": "DAY 28",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to check in and see how you're doing. No agenda, just staying in touch. How's everything going?\"\nVOICEMAIL:\n \"Just a friendly check in. Hope you're doing well. Call me back if you want to chat at [Your Number].\""

      },
      {
        "day": "DAY 30",
        "type": "email",
        "subject": "The questions most sellers don't ask (but should)",
        "body": "#lead_first_name#,\nMost sellers ask about price, timing, and how long it will take to sell. Those are important.\nBut there are a few questions that make the whole experience easier when you think about them early.\nHow flexible do I need to be with showings?\n Buyers shop on their schedule, not yours. The homes that allow easy access usually get more showings. More showings typically leads to more leverage.\nWhat happens if the appraisal comes in low?\n It's not a scary topic, it's just something to be prepared for. Knowing your options ahead of allows you to make confident decisions instead of reacting under pressure.\nWhat does it really feel like to live in a show-ready house?\n For some people it's no big deal. For others it's exhausting. It helps to have a plan for pets, clutter, daily routines, and how to keep it simple.\nMost sellers don't think about this stuff until they're in the middle of it. Then it feels stressful.\nWhen you're ready to list, these are the conversations we'll have upfront so you feel prepared, not surprised.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 45",
        "type": "text",
        "subject": "",
        "body": "Random thought. Do you know what homes in your neighborhood are actually selling for right now? Most people are basing it on old info."
      },
      {
        "day": "DAY 58",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Hope you're doing well. Wanted to see if selling has been on your mind at all, or if it's on the back burner.\"\nVOICEMAIL:\n \"Just checking in. Call me back when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 60",
        "type": "email",
        "subject": "The biggest mistake sellers make (and how to avoid it)",
        "body": "Hey #lead_first_name#,\nI've seen one mistake create a lot of frustration for sellers.\nThey price based on emotion instead of strategy.\nIt makes sense. Your home holds memories. You've invested time, energy, money, and care. It's personal.\nBut buyers don't price emotionally. They compare your home to everything else available and decide what it's worth to them today.\nWhen a home is priced too high, it usually sits. And once it sits, buyers start asking questions. Momentum slows. Then reductions happen later, and the seller ends up negotiating from a weaker position.\nThe goal is to price in a way that creates interest and urgency early. That's when you have the most leverage.\nIf you ever want a pricing conversation that's clear and honest, with the \"why\" behind it, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 75",
        "type": "text",
        "subject": "",
        "body": "Be honest. If you listed tomorrow, do you know what price would actually create showings and offers? Most people are guessing."
      },
      {
        "day": "DAY 88",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to stay in touch. Have you been thinking about selling, or mostly just keeping an eye on things?\"\nVOICEMAIL:\n \"Friendly check in. Hope things are good. Call me when you can at [Your Number].\""

      },
      {
        "day": "DAY 90",
        "type": "email",
        "subject": "What \"doing it right\" looks like for sellers",
        "body": "#lead_first_name#,\nHere's what I want you to know as a seller.\nA strong sale usually comes down to three things: pricing, presentation, and a clear plan.\nWhen those pieces are aligned, the process tends to feel smoother and the outcome is stronger.\nWhen they're not aligned, sellers usually feel like they're constantly reacting. Feedback comes in. Showings slow down. Pressure builds. Price reductions start to creep in.\nThe good news is, most of this can be controlled with preparation and strategy, even if you are months out from selling.\nIf you ever want to talk through what \"doing it right\" would look like for your specific house, I'm happy to share what I'd recommend. No pressure, just a plan.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 105",
        "type": "text",
        "subject": "",
        "body": "Quick question. What would actually make you pull the trigger on selling? A life change, a timeline, a number, something else?"
      },
      {
        "day": "DAY 118",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Sent you a quick note on seller strategy. Did any of that line up with what you've been thinking about?\"\nVOICEMAIL:\n \"Have some helpful seller insight if you ever want to talk it through. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 120",
        "type": "email",
        "subject": "How [Client Name] made a few smart updates and came out ahead",
        "body": "Hey #lead_first_name#,\nI want to tell you about [Client Name].\nThey were ready to sell, but their home felt a little behind some of the updated listings nearby. They were worried buyers would compare and discount them.\nSo we talked through two clear paths.\nOption one was listing as-is and pricing accordingly.\nOption two was making a few strategic updates that would help the home show better and compete stronger.\nThey chose option two. Nothing extreme. Just the kind of updates that move the needle: fresh paint, simple landscaping, and a few key cosmetic improvements.\nThe result was stronger interest, better offers, and a sale that exceeded what they expected.\nThe takeaway is this. Sometimes spending a little, in the right places, creates a much better outcome. Not always. But when it's strategic, it's powerful.\nIf you ever want to talk through what would be worth doing for your home, I can help you sort it out.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 135",
        "type": "text",
        "subject": "",
        "body": "That story about strategic updates is real. Sometimes spending a little in the right places makes a big difference."
      },
      {
        "day": "DAY 148",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Checking in. Hope everything's going well. Still thinking about selling at some point?\"\nVOICEMAIL:\n \"Just staying in touch. Call me back when you can at [Your Number].\""

      },
      {
        "day": "DAY 150",
        "type": "email",
        "subject": "What actually makes a home sell well",
        "body": "#lead_first_name#,\nA lot of people assume homes sell because of trendy upgrades.\nSometimes that helps, but the biggest drivers are usually simpler than people think.\nPrice: If the price is wrong, even a beautiful home will sit.\n Presentation: Clean, bright, cared for, and easy to imagine living in.\n Marketing: The first showing happens online, so photos and messaging matter.\nWhat matters most is that everything works together.\nYou don't have to make your home perfect. You do want it to feel well cared for, positioned correctly, and launched with intention.\nIf you ever want an honest take on what would matter most for your home, I'm here.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 165",
        "type": "text",
        "subject": "",
        "body": "Random thought. If you sold, would you prioritize selling fast, getting top dollar, or keeping the process simple? Knowing the priority helps shape the strategy."
      },
      {
        "day": "DAY 178",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That email about what actually sells homes, did it make sense? Want to make sure I'm sending useful stuff.\"\nVOICEMAIL:\n \"Hope that last email was helpful. Call me if you have questions at [Your Number].\""

      },
      {
        "day": "DAY 180",
        "type": "email",
        "subject": "What buyers notice first (and why it matters)",
        "body": "Hey #lead_first_name#,\nBuyers decide how they feel about a home quickly.\nAnd it's rarely the fancy stuff first.\nThey notice whether it feels clean. Whether it feels bright. Whether it feels cared for.\nThey notice smells. Clutter. Pet items. Busy walls. Overfull closets. Little things that make a home feel \"lived in\" in a way that's hard for them to see themselves in it.\nThat doesn't mean you have to erase your life.\nIt just means that when it's time to sell, we want to make it easy for buyers to imagine their life there.\nSimple steps usually matter most: declutter, freshen up, neutralize odors, and create space.\nIf you ever want a short \"show-ready without losing your mind\" checklist, reply and I'll send it.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 195",
        "type": "text",
        "subject": "",
        "body": "Most buyers decide how they feel in the first minute. The rest of the showing usually confirms that first impression."
      },
      {
        "day": "DAY 208",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just checking in to see how you're doing. Still keeping selling in the back of your mind?\"\nVOICEMAIL:\n \"Hope you're doing well. Call me back when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 210",
        "type": "email",
        "subject": "How [Client Name] sold quickly even when the market felt slower",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey needed a solid result, but they also needed a clear timeline. They didn't want months of uncertainty.\nSo we built a plan around what we could control. Strategic pricing, clean presentation, strong marketing, and a launch that made the first weekend count.\nThey didn't chase a perfect scenario. They executed a smart one.\nAnd it worked.\nIf you ever want to talk through what a timeline-based strategy could look like for you, I'm happy to map it out.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 225",
        "type": "text",
        "subject": "",
        "body": "Quick question. If you sold, would you stay in the area or move somewhere different? That answer changes the strategy."
      },
      {
        "day": "DAY 238",
        "type": "call",
        "subject": "",
        "body": "\"Hey! That story about selling efficiently comes down to strategy. Want to talk about how that could apply to your home?\"\nVOICEMAIL:\n \"Let's talk strategy when you're ready. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 240",
        "type": "email",
        "subject": "The questions buyers ask that sellers should be ready for",
        "body": "Hey #lead_first_name#,\nWhen buyers tour homes, they tend to ask the same core questions.\nHow old are the major systems? Roof, HVAC, water heater.\n What are the typical utility costs?\n Has anything been updated recently?\n Is there anything they should know before they fall in love with it?\nThis is why preparation matters.\nWhen a seller is ready with clear answers and we address the right things upfront, buyers feel more confident. Confidence creates better offers and smoother inspections.\nIf you want, I can tell you the exact questions buyers would ask about your home so you can start preparing now, even if you're not listing soon.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 255",
        "type": "text",
        "subject": "",
        "body": "If you listed tomorrow, could you answer most buyer questions quickly and confidently? Sometimes preparation is the difference."
      },
      {
        "day": "DAY 268",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Checking in. How's everything going? Still thinking about selling eventually?\"\nVOICEMAIL:\n \"Hope things are good. Just staying in touch. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 270",
        "type": "email",
        "subject": "The truth about timing the market as a seller",
        "body": "#lead_first_name#,\nEveryone wants to know the best time to sell.\nHere's the honest answer. There is rarely a perfect time. There is the right time for you.\nSeasonality can matter, but what matters more is your readiness. Your plan. Your ability to prepare the home well. Your comfort with the timeline.\nSellers who plan ahead tend to sell on their terms. Sellers who wait until they are forced to move often feel rushed, and rushed decisions can cost money.\nIf you ever want to talk through timing for your life, we can keep it simple and map out options.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 285",
        "type": "text",
        "subject": "",
        "body": "Have you thought about what you'd need to do to get your home ready to sell? Sometimes it's less than you think."
      },
      {
        "day": "DAY 298",
        "type": "call",
        "subject": "",
        "body": "\"Hey! Sent you that email about timing. Any questions about whether a move would make sense for you?\"\nVOICEMAIL:\n \"Let's talk timing when you're ready. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 300",
        "type": "email",
        "subject": "What your home communicates to buyers (and why it matters)",
        "body": "Hey #lead_first_name#,\nWhen buyers walk through a home, they're not just looking at rooms.\nThey're looking for cues.\nDoes this feel cared for? Does it feel maintained? Does it feel like the seller has stayed on top of things?\nIt's not about having the newest finishes.\nBuyers can see past dated style. What they struggle to see past is obvious neglect, strong odors, heavy clutter, or a home that feels difficult to maintain.\nPreparation is not about perfection. It's about trust.\nMy job is to help you tell the right story. A home that feels clean, bright, and well-loved, so buyers can picture themselves there and feel confident making an offer.\nIf you want to talk about what your home would need to communicate to buyers, we can walk through it.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 315",
        "type": "text",
        "subject": "",
        "body": "Presentation isn't about perfection. It's about showing you care. Buyers feel that."
      },
      {
        "day": "DAY 328",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! It's been a while since we first connected. Wanted to check in and see where you're at with everything.\"\nVOICEMAIL:\n \"Checking in after all this time. Hope you're doing well. Call me back at [Your Number].\""

      },
      {
        "day": "DAY 330",
        "type": "email",
        "subject": "What it looks like when selling is done well",
        "body": "#lead_first_name#,\nMost sellers don't need more noise. They need a clear plan.\nSelling done well usually looks like this:\nClarity on timing and priorities.\nA realistic pricing strategy backed by data.\nSimple prep that focuses on what buyers actually notice.\nStrong marketing that makes the home shine online.\nA steady process that keeps you informed and supported from start to finish.\nThat's what we aim for.\nNot a stressful sprint. Not guessing. Not crossing fingers.\nJust calm, clear execution with a strategy behind it.\nIf you want, we can do a quick walkthrough and I can tell you exactly what I'd recommend for your home, even if you're still a ways out. Sometimes having the plan early makes everything easier later.\n#agent_sending_email#\n#agent_phone#"
      },
      {
        "day": "DAY 345",
        "type": "text",
        "subject": "",
        "body": "The sellers who plan ahead get to sell on their terms. It's almost always smoother, and usually more profitable too."
      },
      {
        "day": "DAY 358",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#. Just wanted to check in and see how you're doing. Still thinking about selling at some point, or did life head a different direction?\"\nVOICEMAIL:\n \"Just checking in to see where you're at. Hope you're doing well. Call me back when you can at [Your Number].\""

      }
    ]
  },
  "cold-drip": {
    "name": "COLD DRIP CAMPAIGN",
    "notes": "12-Month Stay-In-Touch System\n1 Email Per Month - 1 Call Per Quarter\nTHE APPROACH:\nMonthly emails with client stories, community insights, and personal reflections. Buyer/seller agnostic. Goal is staying top of mind so when they or someone they know needs real estate help, you're the call they make.",
    "touchpoints": [
      {
        "day": "DAY 1",
        "type": "email",
        "subject": "Why I actually got into real estate",
        "body": "Hey #lead_first_name#,\nPeople always ask why I got into real estate.\nThe real answer is simple. I saw how stressful this process can be when people do not have the right guide. Most people are navigating a huge life transition while also juggling work, kids, family, and everything else life throws at them. The last thing they need is confusion or pressure on top of it.\nSo I decided to do it differently.\nMy approach is calm, clear, and very human. I explain things in plain language. I help you make decisions with confidence. I treat you the way I would treat my own family. And I lean on the connections and relationships we have built over the years so you have the right people around you when you need them.\nThat is why I still do this. Not because I love houses. Because I love helping people move forward, feel grounded, and get to the finish line without losing their mind.\nThat's the job. That's why I do it.\n#signature#"
      },
      {
        "day": "DAY 30",
        "type": "email",
        "subject": "The couple who almost gave up (and I'm glad they didn't)",
        "body": "#lead_first_name#,\nLet me tell you about [Client Names].\nThey were tired. They had been thinking about making a move for a while, but every step felt heavy. Too many unknowns. Too many opinions. Too much noise.\nSo we slowed it down and got clear. We talked through what mattered most, what could flex, and what would actually make them feel good about their next chapter.\nThen we shifted strategy. Instead of chasing what everyone else was chasing, we focused on finding the right fit and moving with confidence when the timing was right.\nThey ended up in a home that matched their real life, not just a wishlist. And they got there without the constant stress spiral.\nIf you ever feel like this process is a lot, you're not doing it wrong. You just need a plan and the right support.\n#signature#"
      },
      {
        "day": "DAY 60",
        "type": "email",
        "subject": "The local spots that make [Market] worth living in",
        "body": "Hey #lead_first_name#,\nOne of the best parts of doing real estate in [Market] is getting to know the places that make life here feel like home.\nA few categories of spots we always end up recommending:\nA locally-owned coffee spot where you start recognizing faces fast\nA park, trail, or river spot that reminds you to breathe\nA family-run restaurant that turns into your default \"let's go there\" place\nA small business you would never find unless a local told you\nWhy this matters:\n You are not just making a move. You are stepping into a lifestyle and a community. The little places, the weekend routines, and the familiar faces are what make it feel like you belong.\nIf you ever want recommendations for where to eat, shop, explore, or just settle in, ask anytime. We love that part.\n#signature#"
      },
      {
        "day": "DAY 90",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to reach out and say hi. How are you doing? How's everything going?\"\nVOICEMAIL:\n \"Just wanted to check in and say hello. Hope you're doing well. Give me a call back when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 90",
        "type": "email",
        "subject": "How [Client Name] made the impossible work",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThe situation felt impossible. They needed to make a move, but it involved timing, logistics, and a lot of emotions all at once. The classic question was, \"How do we do this without being in between homes?\"\nSo we mapped it out step by step. We got clear on their options, built a timeline that actually made sense, and then coordinated the pieces so they were not carrying it all alone.\nThey moved once. No chaos. No scrambling. No feeling like they had to figure it out as they went.\nWhat [Client] said: \"[Testimonial Quote]\"\nThis is the part people do not realize. Real estate is often project management, problem solving, and steady guidance through a life transition. That's where we shine.\n#signature#"
      },
      {
        "day": "DAY 120",
        "type": "email",
        "subject": "The family who needed a miracle (and got one)",
        "body": "Hey #lead_first_name#,\nLet me tell you about [Client Family].\nThey were in a lot. Life was moving fast and they had a major change happening. They needed answers, options, and a plan that felt doable.\nSo we went into full support mode. We got organized quickly, clarified the priorities, and handled the coordination so they could focus on their family and the transition itself.\nThis is where relationships matter. Having the right lender, the right contractor, the right movers, the right people around you can make the difference between stressful and smooth.\nIf you ever feel like you are juggling too much to take on a move, you are not alone. That is exactly why we do what we do.\n#signature#"
      },
      {
        "day": "DAY 150",
        "type": "email",
        "subject": "The seller who trusted the process (and came out ahead)",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey had a number in their head. It felt right. They had reasons. It made sense emotionally.\nBut when we looked at the market, buyer behavior, and how homes were being positioned, the smarter move was a different strategy.\nSo we had an honest conversation, built a plan, and focused on what creates momentum.\nThe result was a stronger outcome than they expected, and a smoother experience than they feared.\nThis is why we lead with clarity. The market does not care about our feelings, but it does respond to smart pricing, great presentation, and the right plan.\n#signature#"
      },
      {
        "day": "DAY 180",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to check in and see how you're doing. How's everything going?\"\nVOICEMAIL:\n \"Just wanted to say hi and check in. Hope everything's going well. Call me back when you have time at [Your Number].\""

      },
      {
        "day": "DAY 180",
        "type": "email",
        "subject": "Why I love what I do",
        "body": "Hey #lead_first_name#,\nHad one of those weeks that reminded me why I do this job.\nI helped someone who was navigating a family transition. The kind where it is not just paperwork and timelines, it is emotions, responsibility, and trying to do right by someone you love.\nWe connected them with the right people, handled the logistics, and created a plan that made the process feel supported instead of heavy.\nThat is the part I will never take lightly.\nThis work is not really about houses. It is about helping people move forward in their lives with confidence, calm, and a team who has their back.\nThat's the privilege.\n#signature#"
      },
      {
        "day": "DAY 210",
        "type": "email",
        "subject": "The buyer who thought they couldn't (but they could)",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey were convinced it was not possible. They assumed buying would be too expensive, too complicated, or too far out of reach.\nSo we did what we always do. We got clear. We looked at real numbers. We talked through options. We simplified the steps.\nAnd what they realized was this: they did not need perfect conditions. They needed a plan and the right support.\nNow they have stability, ownership, and a path forward that feels strong.\nIf you have questions you feel like you should already know the answer to, you are not alone. Ask them anyway. That is what we are here for.\n#signature#"
      },
      {
        "day": "DAY 240",
        "type": "email",
        "subject": "What we watch in neighborhoods (and why it matters)",
        "body": "Hey #lead_first_name#,\nA quick behind-the-scenes look at what we pay attention to in a neighborhood. Not just prices, but the things that shape day-to-day life and long-term value.\nHere are a few examples:\nNew local businesses and community gathering spots\nRoad improvements and infrastructure changes\nSchool updates and boundary shifts\nNew construction and how it affects inventory\nBuyer patterns and what people are consistently looking for\nWhy it matters:\nReal estate decisions are not just about a house. They are about lifestyle, ease, and what the area is becoming over time.\nIf you ever want to talk through what you are seeing in your neighborhood or where you want to land next, I'm here.\n#signature#"
      },
      {
        "day": "DAY 270",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to reach out and check in. How are you doing? Everything good?\"\nVOICEMAIL:\n\"Just wanted to say hi and see how you're doing. Hope everything's well. Call me when you get a chance at [Your Number].\""

      },
      {
        "day": "DAY 270",
        "type": "email",
        "subject": "How [Client Name] avoided a costly mistake",
        "body": "#lead_first_name#,\nLet me tell you about [Client Name].\nThey fell in love with a house. It checked the boxes, and they were ready to move fast.\nBut this is where we slow things down just enough to protect you. We asked better questions, looked deeper, and made sure they had the full picture before making a decision.\nIn the end, they avoided a path that would have created stress, repairs, and regret. And they landed in a better fit that made more sense long-term.\nIt is normal to feel attached quickly. Our job is to keep you grounded and help you make a smart decision you still feel good about later.\n#signature#"
      },
      {
        "day": "DAY 300",
        "type": "email",
        "subject": "The question I get asked most (and my honest answer)",
        "body": "Hey #lead_first_name#,\nThe question I get asked most is, \"Is now a good time to buy or sell?\"\nHere's my honest answer. There is rarely a perfect time. There is only the time that makes sense for your life, your finances, and your next chapter.\nWhat actually matters:\nPreparation matters more than timing. Strategy matters more than guessing. Clarity beats chaos every time.\nThe real question is not, \"Is now a good time?\"\nThe real question is, \"Am I ready?\"\nIf you ever want to talk through what ready looks like for you, I'm here. We will keep it simple.\n#signature#"
      },
      {
        "day": "DAY 330",
        "type": "email",
        "subject": "How I actually help people (beyond just the house)",
        "body": "#lead_first_name#,\nMost people think real estate agents unlock doors and write offers.\nThat is not what we do.\nHere is what we actually do:\nWe explain the process so you do not feel overwhelmed\nWe give you options so you never feel stuck\nWe coordinate the moving parts so you are not carrying it alone\nWe connect you with trusted people when you need help\nWe advocate for you when things get stressful or complicated\nThe house is just one piece. The transition is the real work. And we take that seriously.\nIf you ever need us, we're here.\n#signature#"
      },
      {
        "day": "DAY 360",
        "type": "call",
        "subject": "",
        "body": "\"Hey #lead_first_name#! Just wanted to reach out and check in. How have you been? How's everything going?\"\nVOICEMAIL:\n \"Just wanted to check in and see how you're doing. Hope everything's well. Would love to catch up. Give me a call back when you can at [Your Number].\""

      },
      {
        "day": "DAY 360",
        "type": "email",
        "subject": "The weirdest showing I've ever been on (and what it taught me)",
        "body": "#lead_first_name#,\nI've shown hundreds of houses over the years. Most are pretty standard. But some are unforgettable.\nThe weirdest one?\nBeautiful house from the outside. Great neighborhood. Great price. My clients were excited. We walk in and immediately realize something is going on.\nEvery single room had something so specific and so personal that it was impossible to focus on the home itself. It was distracting, loud, and honestly kind of funny once we were back in the car.\nHere's what it taught me:\nWhen you're selling, buyers need to picture themselves in your home. Not you. Not your stuff. Not your collections or your personal style everywhere.\nThe more of you that is visible, the harder it is for them to imagine their life there.\nYour house might not be that extreme, but the principle is the same. Simple, clean, and neutral helps buyers connect faster.\nAnd yes, I still think about that showing sometimes.\n#signature#"
      }
    ]
  },
  "guide-buyer": {
    "name": "Buyer Guide Delivery Email",
    "notes": "",
    "touchpoints": [
      {
        "day": "Trigger",
        "type": "email",
        "subject": "Welcome to #business_name#: We're here to help!",
        "body": "Hi there (client first name),\nWe're so glad you downloaded the #business_name# Buyer Guide.\nBuying a home is exciting, but it can also feel like a lot all at once. Our goal with this guide is to walk you through the process in a clear, steady way so you understand what's happening, why it matters, and what comes next. No pressure. No overwhelm. Just straightforward guidance.\nWhether you're planning to buy soon or simply starting to explore your options, this is a great place to begin. Take your time with it. Make notes. Highlight questions. Come back to it as things start to take shape.\nAnd if at any point you'd like to talk through your situation, ask a question, or get clarity on what your next step could look like, we're here. We're big believers that informed decisions feel better and we're happy to help however that looks for you.\nWe've got this.\nThe #business_name# Team"
      }
    ]
  },
  "guide-seller": {
    "name": "Seller Guide Delivery Email",
    "notes": "",
    "touchpoints": [
      {
        "day": "Trigger",
        "type": "email",
        "subject": "Welcome to #business_name#: We're here to help!",
        "body": "Hi there (client first name),\nWe're so glad you downloaded the #business_name# Seller Guide.\nSelling a home is a big step and it often comes during a meaningful life transition. Whether you're upsizing, downsizing, relocating, or simply exploring your options, our goal with this guide is to walk you through the process in a clear, steady way so you understand what's happening, why it matters, and what comes next. No pressure. No overwhelm. Just thoughtful guidance and a solid plan.\nInside, you'll find insight on preparing your home, pricing strategically for your local market, and navigating negotiations and closing with confidence. Take your time with it. Highlight things. Jot down questions. Come back to it as your plans take shape.\nAnd if at any point you'd like to talk through your timeline, your home's value, or what a smooth selling process could look like for you, we're here. We believe informed decisions feel better and we're happy to support you however that looks.\nWe've got this.\nThe #business_name# Team"
      }
    ]
  }
};
