// Workflow SOPs extracted from CoreOps template documents

export const WORKFLOW_SOPS = {
  'buyer-post-close': [
    {
      id: 'sop-buyer-post-close-0',
      title: 'Buyer Post Close Touch Plan SOP',
      content: `Post Close Touch Plan
Purpose:
To maintain consistent, meaningful client contact for 90 days after closing, nurture long-term relationships, and generate reviews + referrals through intentional follow-up.

STEP 1 — Update CRM + Trigger Post-Close Workflow
Task Owner: Admin
System Used: CRM / Automation Platform
Action:
Update CRM status ⇒ Closed.
Upload closing statement and final docs to client file.
Tag client: Past Client / Closed Buyer / Closed Seller.
Add client to Monthly Newsletter Segment and Post-Closing Campaign.
Post client success story or photo on social (with permission).

STEP 2 — Send Congratulations & Review Request
Task Owner: Admin ⇒ Agent (optional follow-up)
System Used: CRM / Email / Text / Canva Template
Action:
Send "Congrats on Closing Day!" email + branded graphic.
Include review link: [Google / Zillow / Facebook].
When review is received:
⇒ Send handwritten thank-you note.
⇒ Track review completion in CRM.

STEP 3 — Agent Check-Ins and Email Cadence
Task Owner: Agent (blue)
System Used: CRM / Calendar / Email Templates
2 Weeks Post-Close: Call to check in on move-in and home setup.
30 Days Post-Close: Send check-in email ("How is the home feeling so far?").
6 Weeks Post-Close: Call again to check progress or issues.
60 Days Post-Close: Send email with home maintenance tips or vendor referrals.
90 Days Post-Close: Send final check-in email and request referrals ("Who else can I help this year?").

STEP 4 — Automation Tasks (Behind the Scenes)
Task Owner: Automation (Green Tasks in CRM)
System Used: CRM Automations / Zapier / FollowUp Boss / Brivity
Action:
Trigger thank-you gift shipment when closing is marked complete.
"Thank you for supporting my business!" gift sent on [Date].
Log gift in CRM and mark task as "Gift Sent."
Auto-add client to quarterly check-in reminders (ongoing).
Auto-send anniversary and birthday touch emails.

STEP 5 — Referral and Long-Term Follow-Up
Task Owner: Agent + Admin + Automation
System Used: CRM / Referral Tracker / Marketing Platform
Action:
Continue quarterly check-in calls for 1 year post-closing.
Track referrals received from each past client in CRM.
When referral received:
⇒ Send "Thank you for supporting my business" gift.
⇒ Tag referring client as VIP Tier 1/2/3 if applicable.
Add referrer to "Referral Appreciation" workflow.

STEP 6 — Ongoing Nurture and Client Care
Task Owner: Admin / Marketing / Agent
System Used: CRM / Marketing Calendar
Action:
Add clients to Quarterly Touch Plan (events, newsletters, pop-bys).
Update tags for lifestyle segments (families, investors, first-time, etc.).
Rotate clients through Milestone Gift and Event Invitations.
Review CRM for engagement and re-engage inactive clients at 6-month mark.

COMMUNICATION FLOW
Admin ⇒ Agent: Updates when review received or gift sent.
Agent ⇒ Client: Every check-in (call or email).
Automation: Reminders and campaign emails sent automatically.`,
      sourceFile: 'Buyer Post Close Touch Plan SOP.docx'
    }
  ],
  'active-listing': [
    {
      id: 'sop-active-listing-0',
      title: 'Active Listing Process SOP',
      content: `Active Listing Process
Listing Activation Confirmation – How the admin confirms the MLS listing is live, checks all marketing links, and updates the CRM/pipeline tracker to "Active Listing."
Marketing Campaign Launch – How the admin or marketing team activates all listing marketing (social posts, email blasts, print materials, signage, etc.) once the listing is live.
Open House Coordination – How to determine if an open house is part of the marketing plan, schedule it, and trigger the Open House SOP if applicable.
Showing Management – How showings are scheduled and tracked, including calendar invites, lockbox setup, and communication with the seller about times and feedback expectations.
Feedback Collection SOP – How to collect feedback from buyer agents after showings, log responses in the CRM, and categorize as positive, neutral, or negative.
Seller Feedback Review SOP – How to summarize feedback trends and discuss them with the seller in a professional, data-driven way (especially when feedback is negative or repetitive).
Listing Adjustment SOP – How to recommend and implement adjustments to pricing, presentation, or marketing based on seller discussion and feedback results.
Marketing Relaunch SOP – How to refresh marketing efforts after a price change or relaunch — update listing materials, notify database, and boost visibility through all channels.
Offer Review SOP – How to log, organize, and present offers to the seller, including comparison templates and communication protocols.
Negotiation & Acceptance SOP – How to manage counteroffers, document negotiation outcomes, and confirm when the offer is accepted — then transition to the Under Contract process.`,
      sourceFile: 'Active Listing Process SOP.docx'
    }
  ],
  'pre-listing': [
    {
      id: 'sop-pre-listing-0',
      title: 'Listing Marketing Prep Checklist',
      content: `LISTING MARKETING PREP CHECKLIST
PURPOSE:
Prepare all marketing materials needed to promote the listing consistently across platforms once photos are complete.

TASK OWNER:
[ADMIN NAME OR ROLE]

WHEN TO COMPLETE:
[AFTER PHOTOS ARE SCHEDULED]

TOOLS USED:
[CANVA OR DESIGN SOFTWARE]

MARKETING MATERIALS CHECKLIST:
PROPERTY MARKETING:
☐ Create property brochure or feature sheet
☐ Add photos, price, address, and key features
☐ Save final version as PDF

SOCIAL MEDIA GRAPHICS:
☐ Just listed graphic
☐ Coming soon graphic if applicable
☐ Open house graphic if applicable
☐ Branded photo templates for feed and stories

DIGITAL ASSETS:
☐ Resize images for email and CRM use
☐ Create square and vertical image formats
☐ Name files clearly using property address

COPY AND DETAILS:
☐ Confirm listing description is final or approved
☐ Pull key features for captions and graphics
☐ Confirm price, address, and MLS details match

FINAL REVIEW:
☐ Branding is consistent across all materials
☐ Spelling and details are correct
☐ Files are saved in the correct listing folder

EXPECTED OUTPUT:
Complete set of listing marketing materials ready for launch.`,
      sourceFile: 'Listing Marketing Prep Checklist.docx'
    },
    {
      id: 'sop-pre-listing-1',
      title: 'Pre-Listing Process SOP',
      content: `Alert Admin that Property Is in Pre-Listing Stage
Alert Admin that Property Is in Pre-Listing Stage
Purpose: Notify the team to begin pre-listing setup.
Action Steps:
Forward the signed listing agreement to admin/TC.
Include seller contact info, address, and target list date.
Admin updates pipeline tracker and confirms receipt.

Update CRM for Client and Status
Update CRM for Client and Status
Purpose:
Maintain accurate client records, trigger automations, and ensure team visibility.

Steps:
Update the client's status in the CRM to reflect the current phase (e.g. Pre-Listing, Active, Under Contract, Closed).
Add or confirm key details — property address, pricing (if known), and date of agreement or onboarding.
Ensure contact info and tags are correct for segmentation and automation triggers.
Update the CRM dashboard to reflect the new status.
Notify the team or assigned agent of the update if required by workflow.

Customization Notes:
Replace CRM name (FUB, Brivity, Follow Up Boss, etc.) with the client's system.
Adjust status labels to match each team's lifecycle terminology.
Integrate with automations or Zapier triggers if applicable.
If multiple systems are used, confirm updates sync across all tracking tools.


Determine Open House / Staging Plan
Determine Open House / Staging Plan
Purpose: Clarify if staging or an open house is part of the prep.
Steps:
Confirm decisions made during seller consultation.
If open house is planned, add to pre-listing calendar with tentative date.
If staging needed ⇒ go to "Schedule Staging."
If no staging ⇒ move to "Schedule Photography."


Schedule Staging (If Applicable)
Schedule Staging (If Applicable)
Purpose: Ensure property presentation matches brand standards.
Steps:
Agent or admin coordinates with staging vendor.
Confirm install/removal dates relative to photo day.
Add to shared calendar (staging, pickup, return).
Notify seller and confirm access.

Schedule Photography and Videography
Schedule Photography and Videography
Purpose:
Coordinate professional photo and video sessions that align with brand standards and marketing timelines.

Steps:
Schedule the photo and video shoot based on the launch plan and photographer availability.
Confirm the date and time with the photographer, videographer, and seller.
Verify that staging and cleaning are completed at least one day prior to the shoot.
Add the confirmed shoot date and time to the shared team and client calendar.
Send confirmation and prep reminders to all parties involved.

Customization Notes:
Adjust timing based on the client's preferred shoot day or vendor availability.
Replace "photographer/videographer" with in-house or vendor names as needed.
Include any add-ons (drone, twilight, lifestyle shots) in the confirmation details.
Modify communication method (email, text, CRM task) per client workflow.


Send Client "Photo Day Prep" Materials
Send Client "Photo Day Prep" Materials
Purpose:
Help the seller prepare the home for photos and showings.

Steps:
Send the "Photo Day Prep" guide via CRM automation or email.
Add a brief personal note: "This will help your home shine in photos!"
Set or confirm the 48-hour pre-shoot reminder (automation preferred).
(Optional) Send a same-day morning reminder with arrival window and any last-minute tips.
Confirm receipt and answer any questions.

Customization Notes:
Adjust reminder timing (24–72 hours) based on photographer schedule and client preference.
Include market-specific add-ons (trash/recycling day note, parking instructions, pet plan).
If SMS is enabled, mirror the reminder by text for higher delivery/response rates.


Start Drafting Listing in MLS
Start Drafting Listing in MLS
Purpose:
Begin MLS entry early to streamline marketing prep and speed up launch readiness.

Steps:
Transaction Coordinator or Admin begins entering property details in the MLS while waiting on photos.
Draft all key listing remarks — public description, agent remarks, and highlight features.
Confirm and input verified property details including address, pricing, school zones, and neighborhood data.
Attach placeholder photos or video links if available (swap with final media once ready).
Save draft listing and note completion in team tracking system or CRM.

Customization Notes:
Adjust timing based on when listing paperwork and access details are received.
Replace MLS platform name and required fields per market (e.g. Stellar, REcolorado, etc.).
Integrate team-specific workflows (e.g. notify marketing team or update checklist in ClickUp/FUB).


Schedule Sign/Lockbox Install
Schedule Sign/Lockbox Install
Purpose:
Coordinate installation timing to align with photos, showings, and launch.

Steps:
Schedule sign and lockbox installation one day before photos or before go-live, depending on client preference.
Assign installation task to field runner or vendor responsible.
Confirm install location and access instructions (lockbox code, gate info, etc.).
Update installation details in calendar and CRM/FUB task list.
Notify agent or client once installation is complete.

Customization Notes:
Adjust timing based on vendor availability or client workflow.
Update assignment details if the team uses an internal runner, courier, or external service.
Use client-specific systems (e.g., Follow Up Boss, Monday, Asana) for tracking if not using FUB.

Prep Marketing Materials
Prep Marketing Materials
Purpose:
Prepare, organize, and execute all marketing assets — digital, print, social, and email — ahead of a launch or campaign to ensure consistency and efficiency.

Phase 1: Prep Marketing Materials
Goal: Build all creative assets and have them approved before launch.
Steps:
Draft all written materials — captions, email copy, flyer text, and post headlines.
Design visual assets — flyers, social graphics, story templates, and video snippets.
Add placeholders in the content calendar for:
Coming Soon
Just Listed
Open House or Mid-Campaign Update
Sold / Under Contract
Review all materials for brand consistency — fonts, colors, logos, and calls-to-action.
Export final versions for both digital and print use.
Save all approved files in the client's Marketing or Launch folder.

Phase 2: Social Media Captions & Posts
Goal: Create and schedule all launch-related social content.
Steps:
Write captions for the following core posts:
Coming Soon (2–3 days before launch)
Just Listed (on launch day)
Story or Reel (1–3 days after launch)
Behind-the-Scenes or Photo Day (optional)
Sold or Closed (after transaction completion)
Collect or edit visuals — listing photos, videos, reels, and graphics.
Upload all content to the client's chosen scheduling platform (Later, Meta Planner, etc.).
Tag collaborators, team members, and location where appropriate.
Confirm post order, timing, hashtags, and links.
Schedule content to align with the campaign timeline.

Phase 3: Email Marketing Assets
Goal: Use email to promote the launch, maintain engagement, and drive inquiries.
Steps:
Duplicate the client's branded template in Mailchimp or their CRM.
Build the following campaign emails:
Coming Soon (sent 1–2 days before launch)
Just Listed (sent on launch day)
Open House or Mid-Campaign Update (optional mid-week send)
Sold or Under Contract (sent post-sale)
Update each email with current property details, images, and links.
Proofread copy and test all links and formatting.
Schedule sends based on the launch plan.
Track performance metrics — opens, clicks, and conversions.

Phase 4: Review & Optimization
Goal: Ensure alignment across platforms and refine process for next campaign.
Steps:
Confirm all assets (social, email, print) use consistent visuals and messaging.
Store final versions and performance data in the client's system or Hub.
Review what performed well and note improvements for future launches.
Update SOPs or templates based on team feedback.

Customization Notes
Swap specific property or campaign details for each client.
Adjust timing based on client cadence and local market.
Replace platform references (Mailchimp, Later, Canva, etc.) with client tools.
Include additional brand touchpoints (videos, team highlights, lender spotlights) as needed.`,
      sourceFile: 'Pre-Listing Process SOP.docx'
    }
  ],
  'buyer-consultation': [
    {
      id: 'sop-buyer-consultation-0',
      title: 'Buyer System Timing Map',
      content: `Buyer #lead_first_name# #lead_last_name# & Communication Map
CoreOps Collective  |  Strategy to Scale #lead_first_name# #lead_last_name# document maps every touchpoint, email, task, and action in the buyer system — in the exact sequence and timing they should occur. Use it to build automations, set up task sequences, and train your team so nothing falls through the cracks.

#lead_first_name# #lead_last_name# highlighted in amber are timing assumptions based on your templates and workflows. Confirm these with your client before building automations in Lofty.

Stage 1 — Buyer #lead_first_name# #lead_last_name# from initial lead inquiry through MLS search setup. This stage ends when the buyer is active in the system with alerts running and showings beginning.


Stage 2 — Active Shopper Drip #lead_first_name# #lead_last_name# automatically once the MLS search is set up. Runs for 28 days. The campaign pauses when the buyer goes under contract and resumes manually if an offer falls through.


Stage 3 — Buyer Under #lead_first_name# #lead_last_name# most complex stage. Broken into phases that follow the natural arc of a transaction: execution, escrow, earnest money, inspection, appraisal, pre-close, walkthrough, closing, and wrap-up. All email timings marked CONFIRM should be reviewed with the client before automating.


Stage 4 — Post-Close Touch #lead_first_name# #lead_last_name# automatically when CRM status updates to Closed. The 90-day drip runs in the background while agent handles personal touchpoints at 2 weeks and 6 weeks. The handwritten notecard is triggered manually upon review receipt.


Timing Confirmation #lead_first_name# #lead_last_name# are the 15 items flagged throughout this document that need client input before being locked into CRM automations. Go through these with your client before building the task sequences in Lofty.`,
      sourceFile: 'Buyer_System_Timing_Map.docx'
    }
  ]
};
