/* ====================================================================
   MakerMind Tutoring — site configuration

   This is the ONLY file you need to edit to make the enquiry form and
   the booking calendar work. Nothing else references these settings.
   ==================================================================== */
window.MM_CONFIG = {

  /* ------------------------------------------------------------------
     1. WHERE ENQUIRIES GO
     ------------------------------------------------------------------
     A plain HTML page cannot send email on its own — something has to
     receive the form and forward it. Pick one:

     (a) Leave formEndpoint empty.
         The form opens the visitor's own mail app with everything
         filled in, addressed to enquiryEmail. It works today with no
         setup, but the visitor has to press Send themselves, and it
         fails for anyone without a mail app configured.

     (b) Paste a form endpoint.  RECOMMENDED.
         The form is posted in the background and the message arrives
         in your inbox. The visitor just sees "thanks". Free options:

           Formspree  https://formspree.io   ->  https://formspree.io/f/xxxxxxxx
           Basin      https://usebasin.com   ->  https://usebasin.com/f/xxxxxxxx
           Web3Forms  https://web3forms.com  ->  https://api.web3forms.com/submit

         Sign up with enquiries@makermindtutoring.com, create a form,
         and paste the URL it gives you below. Takes about two minutes.
     ------------------------------------------------------------------ */
  enquiryEmail: 'enquiries@makermindtutoring.com',
  formEndpoint: 'https://formspree.io/f/xppaeawd',

  /* ------------------------------------------------------------------
     2. THE BOOKING CALENDAR
     ------------------------------------------------------------------
     Leave provider empty and the site uses the built-in date/time
     picker. That picker cannot know your real availability — the
     greyed-out slots in it are sample data — so it is a placeholder,
     not a booking system.

     Set a provider and the real scheduler is embedded instead. You see
     every booking in your own dashboard, it syncs to your calendar, and
     visitors can only pick times you are actually free.

       provider: 'cal'       Cal.com (free)  https://cal.com
                             user: your booking link, WITHOUT the domain
                             e.g. 'makermind/consult'

       provider: 'calendly'  Calendly (free) https://calendly.com
                             user: your event path, WITHOUT the domain
                             e.g. 'makermind/20min'

     Set up a "Free 20-minute consult" event type, publish it, then copy
     the part of the link after the domain into user below.
     ------------------------------------------------------------------ */
  scheduler: {
    provider: 'calendly',      // '' | 'cal' | 'calendly'
    user: 'enquiries-makermindtutoring/30min',

    /* hideDetails: true strips Calendly's own header from the embed — the
       event name, the duration row and the description — so the page shows
       just the calendar.

       IMPORTANT: on an event type that offers SEVERAL durations, that
       header is also where the invitee picks between them. Hiding it means
       Calendly quietly books your event's DEFAULT duration instead. The
       duration control cannot be moved elsewhere on the page: the whole
       scheduler is an iframe served by Calendly, and nothing here can
       reach inside it or rearrange it.

       So pick one:
         hideDetails: true   + set the event to a single duration (or set
                               the default you actually want) in Calendly.
         hideDetails: false  + keep the header, and the invitee chooses.
                               This is what is set below, so the duration
                               picker stays available. */
    hideDetails: false,

    /* Height of the embed box, in pixels. Calendly needs roughly 700 with
       its header and duration picker showing, and about 560 without. The
       embed also asks to auto-shrink to its content where the browser
       allows it, so this is a starting size rather than a fixed one. */
    height: 700
  }
};
