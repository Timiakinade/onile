# Onile · Shortlet back office prototype

A clickable prototype of Onile, a back office web app for people who manage 10 to 30 shortlet apartments for landlords in Lagos. Money only counts once someone confirms it against the bank app, and no two people can book the same night.

Built for a small usability test and for the Onile case study. Open `index.html` in any browser, or visit the live link.

## Roles

Switch accounts from the profile card at the bottom of the sidebar, or from the Prototype tab on the right edge.

| Role | Person | What changes |
| --- | --- | --- |
| Owner | Omoakin | Sees everything, approves refunds, gives delegated access |
| Manager | Tola Bello | Records payments, runs maintenance, sees expenses only |
| Accountant | Ngozi Eze | Confirms transfers, records refunds, sends statements |

Direct links: `?role=owner`, `?role=manager`, `?role=accountant`.

## What works

* **Payments:** the manager records a transfer, which stays Waiting. The owner or accountant confirms it only after ticking "I found this transfer in our bank app". It then counts as revenue on Finance and on the landlord statement.
* **Bookings:** a new booking that overlaps a stay is blocked before it saves. Try Add booking with the sample values.
* **Maintenance:** marking the Ikoyi 4A clean done turns the unit Ready and clears the alert.
* **Deposits:** the manager requests a return, the owner approves it and the accountant records the refund.
* **Delegated access:** the owner gives Tola time limited powers in Settings, and every action is logged.
* Items a role can't open are hidden from the menu.

## Running a test

Open the Prototype tab and press Reset demo data before each tester. Sample data is saved in the browser, so progress carries across role links on the same device.

## Files

No build step. Plain HTML, CSS and JavaScript: `index.html`, `styles.css`, `core.js` (state, rules, shell), `pages.js` (screens), `actions.js` (drawers and actions), `data.js` (sample data). DM Sans is self hosted under the SIL Open Font License, and the icons come from Lucide under the ISC licence.

Design and prototype by Timi Omoakin.
