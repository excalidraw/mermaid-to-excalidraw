# Mermaid diagram prompts

50 standalone prompts, with ten each for sequence diagrams, flowcharts, class diagrams, entity relationship diagrams (ERDs), and state diagrams. Use each numbered prompt to generate one Mermaid code block. Prompts 41–50 include embedded CSV or JSON datasets, with two additional examples of each diagram type.

Linked sources provide real-world inspiration found through web searches. The prompts describe illustrative designs; their actors, data models, and exception paths are modeling choices.

## Sequence diagrams

### 1. Rescuing a bakery's surplus food

Create a Mermaid `sequenceDiagram` showing a customer reserving a surplus-food bag for an evening pickup. Include Customer, Mobile App, Inventory Service, Payment Service, and Bakery. Show browsing available bags, temporarily reserving the last bag, taking payment, confirming the reservation, and verifying pickup. Use `alt` blocks for a competing customer taking the last bag and for payment failure; release the reservation after a failed payment. Use `opt` for a pickup reminder and `autonumber` for the messages.

The reservation and collection idea comes from [Too Good To Go's explanation of its app](https://www.toogoodtogo.com/en-us/how-does-the-app-work).

### 2. Borrowing a book from another library

Create a Mermaid `sequenceDiagram` for an interlibrary loan involving Patron, Home Library, Loan Broker, Lending Library, and Courier. Begin when the patron requests a book unavailable locally. Use a loop to query candidate lending libraries until one accepts or all decline. Show shipment, arrival notification, checkout, patron return, and shipment back to the lender. Include an alternative outcome for an unfilled request and an optional renewal request that the lender can approve or reject. Use dashed arrows for replies.

The lending and circulation workflow is inspired by [OCLC's interlibrary loan integration workflow](https://help.oclc.org/Resource_Sharing/WorldShare_Interlibrary_Loan/WorldShare_Circulation_Integration/010Integration_Workflow).

### 3. Collecting a parcel from a locker

Create a Mermaid `sequenceDiagram` with Courier, Locker Controller, Delivery Platform, Notification Service, and Recipient. Show the courier assigning a free compartment, depositing a parcel, and closing the door. The locker reports delivery, the platform sends a pickup notification, and the recipient presents a pickup code. Use `alt` for valid versus invalid codes and `loop` for limited retry attempts. Finish with the compartment opening, collection being confirmed, and the compartment becoming available. Add a note explaining that notifications are asynchronous.

The pickup-code and notification scenario is inspired by [DHL's Packstation collection guide](https://www.dhl.de/en/privatkunden/pakete-empfangen/an-einem-abholort-empfangen/packstation/empfangen-packstation.html).

### 4. Online checkout with an authentication challenge

Create a Mermaid `sequenceDiagram` for card checkout with Shopper, Browser, Store Backend, Payment Provider, and Fulfillment Service. Show the backend creating a payment request, the browser confirming it, and an optional authentication challenge. Include successful authentication, abandoned authentication, and declined payment branches. Show the provider delivering an asynchronous payment-success webhook before fulfillment begins. Include a duplicate webhook and show the backend acknowledging it without creating a second shipment. Use activation bars and a note about idempotent event handling.

The payment lifecycle and asynchronous confirmation idea comes from [Stripe's Payment Intents documentation](https://docs.stripe.com/payments/payment-intents).

### 5. Entering a museum with a timed ticket

Create a Mermaid `sequenceDiagram` for timed museum admission with Visitor, Ticket App, Entrance Scanner, Ticket Service, and Occupancy Counter. Show the visitor presenting a QR ticket, the scanner checking the time slot and redemption status, and the ticket service atomically redeeming it. Include branches for early arrival, an already-used ticket, and successful entry. After admission, use `par` to record attendance and update occupancy. Show a second scan of the same ticket being rejected. Keep labels short enough to read on a presentation slide.

### 6. Dispatching roadside assistance

Create a Mermaid `sequenceDiagram` with Driver, Assistance App, Dispatch Service, Tow Operator, and Location Service. Show a breakdown report, location confirmation, and a loop offering the job to nearby operators until one accepts. Include an alternative where no operator is available and the driver receives an escalation message. Once accepted, show periodic arrival updates and an optional cancellation before the operator departs. Finish with arrival, completion confirmation, and a receipt. Group the matching and service-delivery phases with labeled background regions.

## Flowcharts

### 7. Repair café intake and diagnosis

Create a Mermaid `flowchart TD` for a volunteer repair café handling a broken household item. Start with visitor check-in and a description of the fault. Branch on whether a suitably skilled volunteer is available and whether the item can be assessed safely. Show diagnosis, checking for spare parts, attempting a repair, and testing the result. Failed tests should loop back to diagnosis; unavailable parts should lead to a return appointment. End with repaired, referred to a specialist, or responsibly recycled. Use separate subgraphs for intake and the repair bench.

The setting comes from [Repair Café's description of its volunteer repair events](https://www.repaircafe.org/en/about/).

### 08_gemini_3_8_flash Municipal wastewater treatment

Create a Mermaid `flowchart LR` showing a simplified municipal wastewater treatment process: incoming sewage, screening, grit removal, primary settling, biological treatment, secondary clarification, disinfection, and treated-water discharge. Add a separate sludge-processing branch fed by both settling stages, with thickening, digestion, and dewatering. Show a return-activated-sludge loop from secondary clarification to biological treatment. Include a final quality-check decision that sends a failed sample's associated water stream to holding and reprocessing. Group the main water stream and sludge stream into subgraphs with different styles.

The treatment stages are inspired by [the EPA's overview of how wastewater treatment works](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=20004CXG.TXT).

### 09_gemini_3_8_flash Classifying wildlife camera photographs

Create a Mermaid `flowchart TD` for a citizen-science project classifying camera-trap images. Begin with image upload and an automated check for corrupt files. Route images with no animals to an empty-image archive and the others to volunteer classification. Collect independent classifications until there are enough votes. Branch on agreement: publish a consensus label when agreement is sufficient, or send the image to an expert when votes conflict. Let an expert request more evidence or mark the animal unidentifiable. Use distinct shapes for decisions, processing steps, and stored results.

The volunteer-classification setting comes from [Zooniverse's account of Chicago Wildlife Watch](https://daily.zooniverse.org/2024/05/16/tracking-urban-wildlife-a-community-effort/).

### 10_gemini_3_8_flash Quality control at a small coffee roastery

Create a Mermaid `flowchart LR` for a small coffee roastery developing a new roast. Show green-bean intake, lot inspection, sample roasting, resting, cupping, recipe adjustment, production roasting, and packaging. Reject a lot if the intake inspection fails. Loop from an unsatisfactory cupping result back to recipe adjustment and another sample roast. At production quality control, branch into approved for sale, held for investigation, or rejected. Include a side path that records roast settings and tasting notes in a batch log. Label every decision edge.

### 11. Scheduling a rooftop solar installation

Create a Mermaid `flowchart TD` for a fictional solar installer's project workflow, from a homeowner inquiry to system handover. Include site survey, roof suitability, system design, customer approval, permit submission, equipment ordering, installation, inspection, and utility connection. Show design revisions after customer feedback or a permit rejection, and a corrective-work loop after a failed inspection. Equipment ordering and crew scheduling may proceed in parallel after approval. Use subgraphs for Homeowner, Installer, and External Review, and make dependencies clear without inventing jurisdiction-specific deadlines.

### 12. Returning lost property from a hotel

Create a Mermaid `flowchart TD` for a hotel's lost-property desk. Start when housekeeping finds an item, then record its description, discovery location, and storage reference. Branch on whether ownership can be identified. Show contacting a possible owner, checking a claimant's description against the record, choosing collection or shipping, and documenting handover. Include paths for a mismatch, an unreachable guest, and an unclaimed item reaching the hotel's fictional retention deadline. Make secure storage a shared step and use clearly labeled decision branches.

### 13. Reviewing submissions for a neighborhood film festival

Create a Mermaid `flowchart LR` for a neighborhood film festival's submission review. Include submission upload, technical checks, eligibility screening, assignment to two reviewers, scoring, shortlist discussion, rights confirmation, and scheduling. Let filmmakers replace a technically invalid file before a deadline. Conflicting reviewer scores should trigger a third review. Selected films with unresolved screening rights should remain on hold, while declined entries receive a notification. Use subgraphs for automated checks, artistic review, and programming, with a shared final notification step.

### 14. Running a community compost site

Create a Mermaid `flowchart TD` for a community compost site accepting garden waste and food scraps. Include arrival, material inspection, contamination removal, sorting into greens and browns, mixing, active composting, moisture checks, turning, curing, screening, and distribution. Reject unsuitable materials before mixing. Add loops for a pile that is too dry, too wet, or insufficiently decomposed. Send oversized screened material back into a new batch. Use a side branch to log batch observations and color the intake, active processing, and finished-compost stages differently.

The material balance and composting concepts come from [the EPA's overview of composting approaches](https://www.epa.gov/sustainable-management-food/approaches-composting).

## Class diagrams

### 15. Planning a drone photography job

Create a Mermaid `classDiagram` for a drone photography business with Client, Booking, MissionPlan, Waypoint, Drone, Pilot, MediaAsset, Photo, and Video. Make Photo and Video inherit from MediaAsset. A Booking owns one MissionPlan, and a MissionPlan owns an ordered set of Waypoints. Drones and pilots exist independently of bookings and can be assigned to many bookings over time. Add typed attributes and operations such as estimateDuration(), assignPilot(), and exportPreview(). Show visibility markers, association labels, and multiplicities, and note that schedule conflicts are checked by application logic.

### 16. Scheduling spacecraft communications

Create a Mermaid `classDiagram` for a simplified deep-space communications scheduler with Spacecraft, GroundComplex, Antenna, ContactRequest, VisibilityWindow, ScheduledContact, and Scheduler. GroundComplex aggregates Antennas, and a ScheduledContact links one spacecraft, one antenna, and one visibility window. Requests carry priority, requested duration, and a frequency-band requirement. Add methods for findCompatibleAntennas(), detectConflicts(), and reserveContact(). Show multiplicities, composition only where lifetimes depend on an owner, and a note stating that contacts on the same antenna must not overlap in this model.

The visibility-window and antenna-scheduling idea comes from [NASA's explanation of communicating with Webb through the Deep Space Network](https://science.nasa.gov/blogs/webb/2023/08/15/talking-with-webb-using-the-deep-space-network/).


### 17. Scaling recipes into a weekly meal plan

Create a Mermaid `classDiagram` with Recipe, RecipeIngredient, Ingredient, Unit, MealPlan, MealSlot, PantryItem, and ShoppingListEntry. Use RecipeIngredient to attach an amount and unit to an ingredient within a recipe. MealPlan owns MealSlots, each of which references a recipe and a serving count. PantryItems track quantities and optional expiration dates. Add scaleServings(), convertQuantity(), and calculateShortfall() methods with return types. Show composition, ordinary associations, multiplicities, and a note that incompatible measurement units require an explicit conversion rule. Use colors.


## Entity relationship diagrams (ERDs)

### 18. Storing a city's public-transit timetable

Create a Mermaid `erDiagram` for a simplified transit timetable with AGENCY, ROUTE, TRIP, STOP, STOP_TIME, SERVICE_CALENDAR, and SERVICE_EXCEPTION. Connect agencies to routes, routes to trips, and service calendars to trips. Resolve the relationship between trips and stops through STOP_TIME, whose composite primary key is trip_id plus stop_sequence so that a trip may revisit a stop. Give service exceptions a composite key of service_id and date. Include typed attributes, PK and FK markers, arrival and departure times, and labeled crow's-foot cardinalities.

The entities and stop-time key are inspired by [the GTFS Schedule reference](https://gtfs.org/documentation/schedule/reference/).

### 19. Tracking a museum collection and outgoing loans

Create a Mermaid `erDiagram` for a museum with COLLECTION, OBJECT, CREATOR, OBJECT_CREATOR, LOCATION, MOVEMENT, BORROWING_INSTITUTION, LOAN, and LOAN_ITEM. Resolve multiple creators per object through OBJECT_CREATOR. Each movement records one object's origin, destination, and timestamp; label the two LOCATION relationships clearly. Resolve objects included in loans through LOAN_ITEM, allowing an object to participate in different loans over time. Include accession numbers as unique keys, primary and foreign keys, optional creator attribution, and cardinalities. Add a Mermaid comment explaining that overlapping active loans require a separate constraint.

The catalog setting is inspired by [the Smithsonian's collections overview](https://www.si.edu/collections).

### 20. Packing community-supported agriculture shares

Create a Mermaid `erDiagram` for a farm subscription program with FARM, SEASON, SHARE_TYPE, HOUSEHOLD, SUBSCRIPTION, PICKUP_SITE, HARVEST_BATCH, DELIVERY, and DELIVERY_ITEM. A farm offers share types for a season, households buy subscriptions, and each subscription selects a pickup site. Each delivery belongs to one subscription and contains items drawn from harvest batches, allowing one batch to supply many households. Record crop name, harvest date, quantity, unit, and pickup status. Include primary and foreign keys and clearly distinguish planned deliveries from deliveries that already have packed items.

The seasonal subscription setting comes from [the USDA's description of community-supported agriculture](https://www.ams.usda.gov/local-food-directories/csas).

## State diagrams

### 21. Running a public electric-vehicle charger

Create a Mermaid `stateDiagram-v2` for one charging connector with Available, Connected, Authorizing, Charging, Suspended, Finishing, Unavailable, and Faulted states. Start in Available. Show cable connection, authorization success or failure, charge start, temporary suspension, resume, driver stop, unplugging, and maintenance events. Use a choice state after authorization and a composite ActiveSession containing Charging and Suspended. Label transitions with events and guards. Add fault transitions from session states, require a successful diagnostic check before returning to service, and include a note that this is a simplified operational model.

The charger-to-management-system setting is inspired by [the Open Charge Alliance's OCPP overview](https://openchargealliance.org/protocols/open-charge-point-protocol/).

### 22. Preserving a seed collection in a seed bank

Create a Mermaid `stateDiagram-v2` for a seed-bank accession with Received, Assessed, Drying, Cleaning, ViabilityTesting, Stored, RecollectionRequested, and Retired states. After assessment, use a choice to separate seeds suitable for conventional dry storage from those requiring specialist handling. Stored accessions periodically enter viability testing and return to storage when results are acceptable; poor results trigger a recollection request. Show a loop for additional drying when a moisture check fails. Use labeled events, an initial state, and a final state for retirement; treat testing as sampling an accession rather than removing every stored seed.

The preservation stages and exceptional-seed branch are inspired by [Kew's account of how seeds reach the Millennium Seed Bank](https://www.kew.org/read-and-watch/seed-collecting-msb).

### 23. Controlling an elevator cabin

Create a Mermaid `stateDiagram-v2` for a simplified elevator cabin. Use Idle, MovingUp, MovingDown, DoorOpening, DoorOpen, DoorClosing, and OutOfService states. A choice state should select travel direction from the requested floor and current floor. Show arrival, door timers, obstruction detection that reopens closing doors, and a new request while idle. Enclose travel and door operation in a composite Operational state. Add emergency-stop and maintenance-reset transitions, and annotate that movement is permitted only when doors are confirmed closed. Keep the model focused on one cabin rather than scheduling multiple elevators.

### 24. Moving a boat through a canal lock

Create a Mermaid `stateDiagram-v2` for an illustrative upward passage through a canal lock. Start with the chamber at the lower water level and both gates closed. Show lower-gate opening, boat entry, lower-gate closing, chamber filling, upper-gate opening, boat exit, and upper-gate closing. Include guards requiring gate-closed confirmation before filling and water-level equalization before opening the upper gate. Add an obstruction path and a Paused state that requires operator confirmation to resume. Finish with an Emptying state that returns the lock to its initial ready condition.

### 25. Completing a washing-machine program

Create a Mermaid `stateDiagram-v2` for a washing machine with Idle, DoorLocked, Filling, Washing, Draining, Rinsing, Spinning, Completed, and Fault states. Group the wash program into a composite Running state. Model repeated rinse cycles with a guard on a rinse counter, an imbalance event that returns Spinning to a load-redistribution state, and a water-fill timeout that enters Fault. A pause request should lead to a draining-and-unlock sequence when necessary. Label transitions with events and conditions, and make starting a cycle depend on the door being closed.

### 26. Tracking a sourdough bakery batch

Create a Mermaid `stateDiagram-v2` for a bakery's sourdough batch with Planned, Mixing, BulkFermenting, Dividing, Shaping, Proofing, Baking, Cooling, Released, and Rejected states. Make BulkFermenting a composite state containing Resting and Folding substates, with repeated folds controlled by a counter. A readiness check decides whether to continue fermentation or proceed to dividing. Include a quality-check branch after cooling and a hold state for batches awaiting review. Label transitions with production events and illustrative guards rather than prescribing exact temperatures or fermentation times.

### 27. Processing a photographer's export job

Create a Mermaid `stateDiagram-v2` for a photo export job with Queued, Running, Paused, Failed, Cancelled, and Completed states. Within Running, use a fork to start ImageRendering and MetadataPackaging in parallel, then a join before Uploading. Model a recoverable upload error with a bounded retry loop and an exhausted-retry transition to Failed. Allow cancellation from Queued, Running, and Paused. Include an explicit resume path that returns to the interrupted stage, and a note explaining which intermediate artifacts are retained for retries. Use initial and final states.

### . Synchronizing an offline field survey

Create a Mermaid `stateDiagram-v2` for a field-survey submission that works without network access. Include Draft, Validating, ReadyToSync, Syncing, Conflict, Synced, and Archived states. Failed validation returns to Draft; a valid submission waits in ReadyToSync while offline. During Syncing, model concurrent answer-upload and attachment-upload regions, with success requiring both to finish. A network failure returns to ReadyToSync without discarding completed uploads. A server version conflict leads to Conflict, where the user can merge changes or accept the server version. Label events, guards, and retry behavior clearly.

## Prompts with embedded data

All datasets below are fictional. Include the dataset when copying a prompt. Each diagram should display the requested values from its dataset; preserve units and identifiers, and calculate any requested totals from the supplied rows.

### . Reconstructing a restaurant order from a CSV trace

Create a Mermaid `sequenceDiagram` from the following CSV trace for order ORD-204. Use one participant per unique sender or receiver and preserve row order. Label every message with its elapsed time and payload, using dashed arrows for rows marked response. Show the kitchen's progress update as asynchronous and add a note with the total elapsed time from order placement to collection. Preserve the item quantities, euro amounts, and order identifier. Use `autonumber` and distinguish the payment phase from preparation and collection.

```csv
elapsed_seconds,sender,receiver,kind,message,payload
0,Customer,OrderingApp,request,Place order,ORD-204: 2 soups at EUR 6.50 each
1,OrderingApp,PaymentService,request,Authorize payment,ORD-204: EUR 13.00
3,PaymentService,OrderingApp,response,Payment authorized,AUTH-871: EUR 13.00
4,OrderingApp,Kitchen,request,Prepare order,ORD-204: 2 soups
8,Kitchen,OrderingApp,response,Order accepted,Estimated preparation: 180 seconds
120,Kitchen,OrderingApp,event,Preparation update,ORD-204: packing
188,Kitchen,OrderingApp,event,Order ready,Pickup counter B
189,OrderingApp,Customer,event,Notify customer,ORD-204 ready at counter B
240,Customer,Kitchen,request,Collect order,ORD-204
245,Kitchen,OrderingApp,event,Collection confirmed,ORD-204: 2 soups handed over
```

### . Following a weather station's telemetry retry

Create a Mermaid `sequenceDiagram` from the JSON event log below. Use WeatherStation, Gateway, IngestionAPI, and Dashboard as participants. Convert each event into a message containing its time and payload values. Show a timeout as a self-message on Gateway, group the two publish attempts in a labeled retry region, and explain in a note that both attempts carry the same reading ID. The API should store the reading once and forward one update to the dashboard. Preserve temperature, humidity, battery percentage, and attempt numbers; show only the events present in the log.

```json
{
  "reading": {
    "id": "WX-318",
    "station_id": "HILL-07",
    "temperature_c": 12.8,
    "humidity_percent": 76,
    "battery_percent": 42
  },
  "events": [
    {"time": "06:00:00", "from": "WeatherStation", "to": "Gateway", "event": "reading_received", "reading_id": "WX-318"},
    {"time": "06:00:01", "from": "Gateway", "to": "IngestionAPI", "event": "publish", "attempt": 1, "reading_id": "WX-318"},
    {"time": "06:00:02", "from": "IngestionAPI", "to": "Dashboard", "event": "reading_stored", "reading_id": "WX-318"},
    {"time": "06:00:06", "from": "Gateway", "to": "Gateway", "event": "acknowledgment_timeout", "wait_seconds": 5},
    {"time": "06:00:07", "from": "Gateway", "to": "IngestionAPI", "event": "publish", "attempt": 2, "reading_id": "WX-318"},
    {"time": "06:00:08", "from": "IngestionAPI", "to": "Gateway", "event": "already_stored", "reading_id": "WX-318"}
  ]
}
```

### . Showing a recycling facility's material balance

Create a Mermaid `flowchart LR` from the CSV material-flow data below. Represent each distinct source or destination as a node and label every edge with the material and kilograms transferred. Add the total intake to the Intake node and calculate each final destination's share of that intake, rounded to one decimal place. Verify that every processing node's incoming mass equals its outgoing mass. Use separate colors for recovered materials and disposal, and group the sorting stages in a processing subgraph. Make the numeric labels readable without relying on edge thickness.

```csv
source,destination,material,mass_kg
Intake,InitialSort,Mixed recycling,1000
InitialSort,PaperBaler,Paper and cardboard,420
InitialSort,GlassCrusher,Glass,260
InitialSort,PlasticSorter,Plastics,240
InitialSort,Disposal,Contamination,80
PaperBaler,PaperMill,Recovered paper,400
PaperBaler,Disposal,Paper rejects,20
GlassCrusher,GlassWorks,Glass cullet,250
GlassCrusher,Disposal,Glass rejects,10
PlasticSorter,PETRecycler,PET,150
PlasticSorter,HDPERecycler,HDPE,60
PlasticSorter,Disposal,Unrecoverable plastics,30
```

### . Visualizing one week's support-ticket routing

Create a Mermaid `flowchart TD` from the following CSV. Treat each row as an observed route and label its edge with both the ticket count and its percentage of all tickets leaving that row's source node, rounded to one decimal place. Show the week's total on Received, and calculate total tickets reaching Resolved and Escalated. Group the four category nodes into a Triage subgraph, use a shared Resolved node, and style Escalated distinctly. Include all routes, including small branches, and preserve the category names.

```csv
source,destination,tickets
Received,Billing,40
Received,AccountAccess,35
Received,BugReport,30
Received,GeneralQuestion,15
Billing,Resolved,32
Billing,Escalated,8
AccountAccess,Resolved,30
AccountAccess,Escalated,5
BugReport,Resolved,12
BugReport,Escalated,18
GeneralQuestion,Resolved,14
GeneralQuestion,Escalated,1
```

### . Designing an aquarium model from exhibit data

Create a Mermaid `classDiagram` for the JSON dataset below using Aquarium, Tank, Population, and Species classes. Aquarium owns one or more Tanks; each Tank owns zero or more Populations; each Population references exactly one Species, and a Species may appear in many tanks. Use composition for owned objects and an ordinary association for Species. Add typed attributes and methods such as totalAnimals() and animalsPer100Liters(). Attach notes with the aquarium name, both tanks' volumes and temperatures, each population's count, and the calculated total animals per tank. Keep record IDs as sample values in notes.

```json
{
  "aquarium": {"id": "AQ-1", "name": "Harbor Discovery Aquarium"},
  "species": [
    {"id": "SP-1", "common_name": "Clownfish", "scientific_name": "Amphiprion ocellaris"},
    {"id": "SP-2", "common_name": "Blue tang", "scientific_name": "Paracanthurus hepatus"},
    {"id": "SP-3", "common_name": "Moon jelly", "scientific_name": "Aurelia aurita"}
  ],
  "tanks": [
    {"id": "T-10", "name": "Reef Corner", "volume_liters": 800, "temperature_c": 25.0},
    {"id": "T-20", "name": "Jelly Gallery", "volume_liters": 1200, "temperature_c": 18.5}
  ],
  "populations": [
    {"tank_id": "T-10", "species_id": "SP-1", "count": 12},
    {"tank_id": "T-10", "species_id": "SP-2", "count": 4},
    {"tank_id": "T-20", "species_id": "SP-3", "count": 30}
  ]
}
```

### . Modeling an outdoor-gear rental inventory

Create a Mermaid `classDiagram` from the two CSV datasets below. Define an abstract Gear class with Tent and Kayak subclasses, plus Customer and Rental. Every rental references exactly one customer and one gear item; both customers and gear items can have many rentals over time. Treat empty subtype-specific cells as not applicable. Include typed attributes and a rentalCost() method, with rate_eur_per_day stored on Rental as the agreed rate. Add notes listing all three gear records and both rentals, including each rental's calculated euro cost. Represent duration in whole days and preserve the sample identifiers.

Gear inventory:

```csv
gear_id,type,name,daily_rate_eur,capacity_people,length_m
G-11,Tent,Alpine Four,18.00,4,
G-12,Kayak,River Scout,32.00,1,3.2
G-13,Tent,Trail Two,12.00,2,
```

Rentals:

```csv
rental_id,customer_id,customer_name,gear_id,days,rate_eur_per_day
R-801,C-21,Mira,G-11,2,18.00
R-802,C-22,Jonas,G-12,3,32.00
```

### 28. Mapping animal foster-placement records

Create a Mermaid `erDiagram` from these CSV tables. Use ANIMAL, FOSTER_HOME, and PLACEMENT entities with typed attributes and PK/FK markers. Each placement belongs to exactly one animal and one home; animals and homes may have zero or more placements over time. An empty end_date denotes a current placement. Include representative CSV values as visible attribute comments, including animal names, home capacities, and placement dates. Add the supplied table row counts to the entity display labels. Use Mermaid comments to document the rule that an animal's placements cannot overlap, and distinguish that rule from what the sample rows alone establish.

Animals:

```csv
animal_id,name,species,intake_date
A-01,Maple,Cat,2025-03-01
A-02,Comet,Dog,2025-03-03
A-03,Pip,Rabbit,2025-03-05
```

Foster homes:

```csv
home_id,display_name,capacity
H-01,Riverside Home,2
H-02,Oak Street Home,1
```

Placements:

```csv
placement_id,animal_id,home_id,start_date,end_date
P-01,A-01,H-01,2025-03-02,2025-03-10
P-02,A-01,H-02,2025-03-11,
P-03,A-02,H-01,2025-03-04,
```

### 29. Connecting podcast episodes and guest appearances

Create a Mermaid `erDiagram` from these four CSV tables. Each episode belongs to one podcast, while podcasts may have zero or more episodes. Resolve the many-to-many relationship between episodes and guests through APPEARANCE, using episode_id plus guest_id as its composite primary key. Include all columns with types and appropriate PK/FK markers. Use visible attribute comments for sample titles, durations, publication dates, guest names, and appearance roles, and put row counts in entity display labels. Preserve titles containing commas and include each podcast's calculated total published minutes in the visible comment on PODCAST's title attribute.

Podcasts:

```csv
podcast_id,title
PC-1,City Soundwalks
PC-2,Workshop Stories
```

Episodes:

```csv
episode_id,podcast_id,title,duration_minutes,published_date
EP-1,PC-1,"Trams, bells and bicycles",28,2025-04-01
EP-2,PC-1,The midnight bakery,34,2025-04-08
EP-3,PC-2,Repairing a wooden canoe,42,2025-04-03
```

Guests:

```csv
guest_id,display_name,specialty
GU-1,Lea,Sound recording
GU-2,Samir,Baking
GU-3,Inez,Woodworking
```

Appearances:

```csv
episode_id,guest_id,role
EP-1,GU-1,Interviewee
EP-2,GU-1,Field recorder
EP-2,GU-2,Interviewee
EP-3,GU-3,Demonstrator
```

### . Explaining refund-request outcomes with transition counts

Create a Mermaid `stateDiagram-v2` from this CSV of aggregated transitions for one completed cohort of refund requests. Map START and END to Mermaid's initial and final pseudostates. Label every transition with its event and count. Add notes to Paid, Rejected, and Withdrawn showing their shares of the original cohort, calculated from the data and rounded to one decimal place. Verify that transition counts balance at each ordinary state. Show AwaitingInfo as a detour before review, and preserve the distinction between approval and payment. Counts represent requests passing through a transition, so do not sum all rows to obtain the cohort size.

```csv
from_state,to_state,event,request_count
START,Submitted,received,200
Submitted,Review,documents_complete,160
Submitted,AwaitingInfo,missing_documents,40
AwaitingInfo,Review,information_received,30
AwaitingInfo,Withdrawn,customer_withdrew,10
Review,Approved,eligible,140
Review,Rejected,ineligible,50
Approved,Paid,transfer_confirmed,140
Paid,END,closed,140
Rejected,END,closed,50
Withdrawn,END,closed,10
```

### 50. Applying thermostat thresholds to a day's readings

Create a Mermaid `stateDiagram-v2` from the thermostat configuration and temperature readings below. Use Idle, Heating, and Cooling states, starting in Idle. From Idle, start heating below heat_on_below_c and cooling above cool_on_above_c. Stop heating at or above heat_off_at_or_above_c, and stop cooling at or below cool_off_at_or_below_c. Evaluate one reading at a time in the listed order, keeping the current mode when its exit condition is unmet. Put exact numeric guards on transitions, include self-loops for unchanged modes, and attach notes grouping each timestamp and temperature by its resulting state. This is a continuously operating controller with no final state.

```json
{
  "sensor_id": "STUDIO-01",
  "initial_state": "Idle",
  "thresholds": {
    "heat_on_below_c": 19.0,
    "heat_off_at_or_above_c": 20.0,
    "cool_on_above_c": 25.0,
    "cool_off_at_or_below_c": 24.0
  },
  "readings": [
    {"time": "08:00", "temperature_c": 18.4},
    {"time": "08:05", "temperature_c": 19.2},
    {"time": "08:10", "temperature_c": 20.1},
    {"time": "12:00", "temperature_c": 23.7},
    {"time": "12:05", "temperature_c": 25.6},
    {"time": "12:10", "temperature_c": 24.8},
    {"time": "12:15", "temperature_c": 23.9},
    {"time": "18:00", "temperature_c": 21.3},
    {"time": "20:00", "temperature_c": 18.8}
  ]
}
```
