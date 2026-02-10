# Hatch Sleep iOS Dec 2025 - Full Screen Analysis (0-151)

This document captures the Hatch reference design system and a screen-by-screen breakdown for all 152 screens.

## Global Design System (Consolidated)

### Color System
- Primary background: deep navy gradient with subtle noise texture (#0b2034 to #0f2a42 range).
- Surface/cards: slightly lighter navy/blue panels with soft inner glow.
- Primary action: teal/aqua (#2db7c6 to #39c2d1) on rounded pill buttons.
- Secondary action: dark navy pill or outlined teal pills on dark background.
- Accent colors: sunrise gradients (peach/orange), lavender, gold, and deep blues for category cards.
- Text: white for primary, soft blue-gray for secondary, muted gray for helper text.
- States: success toast uses green check icon; warning/alert uses orange/yellow glow; error uses red (e.g., delete).

### Typography
- Title: large, centered, sentence case or title case; white.
- Section headers: uppercase or title case, medium weight.
- Body: smaller, subdued blue-gray.
- Button text: medium/semibold, white or navy depending on fill.

### Spacing & Layout
- Large vertical breathing room; centered hero content.
- 8pt grid rhythm; large top/bottom margins.
- Cards and tiles use 16-24pt internal padding.
- Bottom safe area often contains a fixed pill button.

### Shapes & Corners
- Pill buttons with fully rounded ends.
- Cards and sheets with large radius (16-28).
- Input fields are rounded rectangles with subtle borders.

### Shadows & Depth
- Soft shadow around cards and sheets.
- Subtle inner shadows on cards and input fields.
- Glow overlays for loading/saving.

### Buttons
- Primary: large, full-width teal pill.
- Secondary: dark/navy pill with white text.
- Tertiary: teal outline on dark card.
- Destructive: red pill or red text with emphasis.

### Cards & Tiles
- Large feature cards with illustration on right.
- Square/rounded tiles for category grids.
- Toggle pills inside gradient bars (alarm cards).

### Inputs
- Rounded input fields with light border; clear icon on right.
- Password input includes eye icon for reveal.
- Search bar: rounded field with magnifying glass and clear icon.

### Navigation
- Top bar uses inline title and back chevron.
- Tabs: bottom bar with icons and labels; active icon in color.
- Page indicators: small dots, centered.

### Sheets & Modals
- Bottom sheets with rounded top and drag handle.
- Centered alert modals with two buttons (primary teal, secondary dark).

### Iconography & Illustration
- Soft grain illustrations, muted palette, hand-drawn look.
- Icons are simple, rounded, mostly white or teal.

### Motion & State
- Loading: glowing circular overlay with text.
- Saved/Added/Deleted toasts: white pill with icon.
- Progress: thin bars and dot pagers.

## Screen-by-Screen Analysis (0-151)

0. Splash background only: deep navy gradient, grain texture, faint floating shapes, no text.
1. Splash with logo: centered Hatch logo, "Counting sheep..." loader with teal spinner at bottom.
2. Login entry: Hatch logo, prompt "Enter your email to login or sign up", rounded email field, CTA "Let's Go".
3. Email filled: same as 2 but email text filled, clear (x) icon, keyboard visible.
4. Welcome sign-up: title "Welcome to dreamland!", inputs for first name and email, opt-in checkbox, helper card, CTA "Create Account".
5. Welcome sign-up filled: first name and email filled, same layout as 4.
6. Sign-up loading: same as 5 with glowing "Loading" overlay centered.
7. Push notifications intro: illustration of phone and badges, title, body text, CTA "Next".
8. Product scan home: title "Hatch", status "Looking for Hatch products...", plus button row "Add a Hatch Product".
9. Setup intro: title "Let's get this slumber party started", plug illustration, tips, CTA "Let's go".
10. Device wake state: title "Waking up your Hatch, hold tight...", centered circular device placeholder.
11. Device not found: title, instruction, product selection cards (Rest Classic/Rest+/Restore), info card.
12. Recovery found: title "We found your Hatch (Recovery)", device art, CTA "Let's go", secondary "Looking for a different Hatch".
13. Recovery distance alert: modal "Getting warmer...", CTA "Continue connecting".
14. Connect step 1: plug illustration, instruction text, CTA "Next".
15. Connect step 2: bluetooth icon, instruction text, CTA "Next".
16. Waking up device: same state as 10 with circular placeholder.
17. Device selection: title, tap-to-select cards (Restore 2 variants), helper link.
18. Device selection loading: same as 17 with glowing "Loading" overlay.
19. Wi-Fi list: title "Connect to Wi-Fi", list of networks with lock icons, "Join Other Network..." link.
20. Wi-Fi password input (keyboard): title "Let's get connected", input field with eye icon, CTA "Connect", keyboard visible.
21. Wi-Fi password empty: same as 20 without keyboard, empty input with eye icon.
22. Registering device: thin progress bar and text, hero message + CTA "Learn More".
23. Registering device with sample card: title/subtitle, sample content card with play icon, dot pager.
24. Device update completed: progress bar full, Hatch+ grid of benefits, CTA "Continue".
25. Name device: prompt "Almost done!", input field, info card, CTA "Confirm".
26. Name device filled: same as 25 with name entered, keyboard visible.
27. Post-setup prompt: text "Your Restore is ready to go!", two CTAs (dark and teal).
28. Hatch+ trial paywall: feature list, pricing options, CTA "TRY FOR $0.00".
29. Paywall selected plan: plan selection with highlight.
30. Purchase success alert: iOS alert overlay "You're all set".
31. Goal selection: title question, two pill buttons with icons.
32. Choose sleep sound: large card carousel, white outline, play icon, pager dots, CTA "Select".
33. Choose sleep sound next card: same as 32, different card.
34. Customizing loading: message "Great choice!", moon illustration, subtle stars.
35. Rest button hint: text instruction, sun illustration, CTA "Next".
36. Bedtime confirmation: stars, sheep, moon illustration, CTAs "Help Me Rise Rested" and "All Set!".
37. Choose sunrise alarm: card carousel, play icon, CTA "Select".
38. Wake time picker: time wheel, day chips, CTA "Save Alarm".
39. Alarm training: instruction to press Rise button, CTA "Next".
40. Volume training: instruction to tap corners, plus/minus UI on device, CTA "Next".
41. Sunrise duration note: text with sunrise illustration, CTA "Next".
42. Rise & shine completion: birds and sun illustration, CTA "All Set!".
43. Clock settings prompt: modal card with CTA "Go To Clock Settings" and "Set Up Later".
44. My Routine home: top bar, cards for Unwind/Sleep/Alarm, helper tooltip.
45. My Routine (no tooltip): same as 44 with cards only.
46. My Routine with reminder card: top promo card "Reminder to Rest" with close.
47. My Routine with cue card: promo card "Cue to Unwind", unwind list card, add step.
48. My Routine progress card: "6 steps to great rest" card with progress dots.
49. My Routine with unlock card: Hatch+ upsell inside Unwind card.
50. My Routine expanded: stacked cards, sleep step with waveform icon.
51. My Routine alarm and morning moment: sunrise alarm card + morning moment card.
52. Device picker sheet: bottom sheet "Listening on" with device options.
53. Rest reminder explainer sheet: modal with illustration, CTA "Set up a Rest Reminder".
54. Rest reminder settings (off): toggle row, header.
55. Rest reminder settings (on): time row, repeat day chips.
56. Rest reminder saved toast: white pill "Saved" with check.
57. Unwind routines grid: header, cards with locks, categories.
58. Routine detail: large title card, play strip, CTA "Add to My Unwind Routines".
59. Routine saving state: glowing "Saving" overlay.
60. Routine added toast: white pill "Added".
61. Routine card playing: mini equalizer in card.
62. Cue explainer sheet: "A Routine is a Beautiful Thing" with CTA "Add a cue".
63. Cue time picker: time wheel + day chips, CTA "Continue".
64. Cue hue select: stacked color cards with play icons, CTA "Select".
65. Cue hue selected: selected card with outline and equalizer.
66. Cue set confirmation: gradient background, sun icon, CTA "Done".
67. Cue added to routine: cue pill row with toggle in My Routine.
68. 6 steps checklist modal: list of steps with links.
69. 6 steps checklist scrolled: same list lower items.
70. Routine switcher card: horizontal card carousel, done CTA.
71. Empty add card: dashed border add card with plus.
72. Routine card with edit/delete icons: multi-step card, CTA "Swap to this Routine".
73. Upsell card: "Upgrade to Hatch+" with outline CTA "Learn More".
74. Swap loading overlay: glowing "Loading" overlay.
75. My Routine after swap: Sci-Fi Sleep Train as current.
76. Player screen: full-screen playback, wave background, play/pause, volume and lights sliders.
77. Sound library: tab pills (Unwind/Sleep/Wake), hero card CTA, content tiles.
78. Player minimized: control area only (no content) with sliders.
79. Add sleep step sheet: toggles for Sound/Lights, tiles, duration, preview CTA.
80. Add sleep step with lights: color circles, brightness slider, preview CTA.
81. Add sleep saving overlay: glowing "Saving".
82. My Routine with new sleep step: green noise step added, saved toast.
83. Sunrise alarm inline editor: overlay card with time/day chips and Save/Cancel.
84. Add sunrise alarm screen: fields for name/time/schedule/sound, preview CTA.
85. Add sunrise alarm with name set: same as 84 with name "Weekends".
86. Time pickers expanded: sunrise start/end time wheel.
87. Edit sunrise alarm: time set, schedule, sound, preview CTA.
88. Add sunrise alarm lights: sound tiles + lights palettes + brightness slider.
89. Add sunrise alarm delete link: info card + delete text.
90. Add sunrise alarm saving overlay: glowing "Saving".
91. Sunrise alarms list: two gradient alarm cards with toggles.
92. Alarm actions menu: edit/disable/delete popover.
93. Alarm update saving overlay: glowing "Saving".
94. Alarm disabled state: show "Hide disabled alarms".
95. Delete alarm confirm modal: cancel/confirm.
96. Deleted toast: white pill "Deleted".
97. Hatch products list: empty list with add product CTA.
98. Library Unwind featured: top tabs, chips, cards and CTA.
99. Library Meditations category: tab selected, grid of cards.
100. Library Cue category: grid of cue cards.
101. Library Sleep category: tiles for noise and water categories.
102. Library Wake featured: hero card with CTA, category grid.
103. Library trending/favorites: rows of cards with locks.
104. Library lights category: circular swatches + content card.
105. Story detail page: hero art, title, metadata, Preview/Add buttons.
106. Story detail scrolled: list of parts with play icons.
107. Immersive light bottom sheet: explanation + CTA "Got it".
108. Add to routine modal: choose routine list + Add/Cancel.
109. Add routine selected: selection highlight + Add enabled.
110. Saving overlay on story detail: glowing "Saving".
111. Saved toast on story detail: white pill "Saved".
112. Search screen: search bar, empty state illustration, keyboard.
113. Search results loading: ghosted list placeholders.
114. Search results list: sections for routines and channels.
115. Search results scrolled: more channels list.
116. Filter bottom sheet: type toggles, category chips, duration chips, Apply/Reset.
117. Filter selection: Sound selected, duration selected.
118. Filter selection variant: duration chip highlighted (short).
119. Filter results: sections for channels and cues.
120. Settings root: sections, toggles, list rows, sign out.
121. Device settings: name, clock/display, rest reminder, wifi, device info.
122. Clock and display: clock toggle, off/on time, brightness sliders.
123. Account info: password change fields with Update button.
124. Sign out confirm modal: "Sign Out?" with No/Yes.
125. Forgot password: email field and Reset Password CTA.
126. Forgot password success modal: "Check your email".
127. Account info edit: name/email fields, Update Account, Change Password, Delete Account.
128. Delete account confirm modal: Cancel/Delete Account (red).
129. Contact us: list rows "Contact Us", "Rate Our App".
130. Device settings (alt): network update Wi-Fi on, firmware/timezone.
131. Clock and display (always off): dropdown open with options.
132. Clock and display (off at night): shows off/on time rows.
133. Clock display time picker: Turn Off time wheel visible.
134. How to use Restore (rest button): numbered steps list with pager dots.
135. How to use Restore (rise button): numbered steps list with pager dots.
136. Account info (change password): update form without text.
137. Account info success modal: "Success" with OK.
138. Account info delete modal: "Delete your Account?" confirm/cancel.
139. Contact us view: list of contact/rate rows.
140. Login with magic link: email field + CTA "Send Magic Link".
141. Login with password: email + password fields, "Forgot your password?" link.
142. Login password empty focus: same as 141 without password text.
143. Magic link sent modal: "Magic link sent!" with OK.
144. Push notifications intro (repeat): same layout as 7.
145. Product scan empty: "Looking for Hatch products..." with add button.
146. Setup intro (repeat): "Let's get this slumber party started" with CTA.
147. Device wake loading (repeat): "Waking up your Hatch" with circle.
148. Device not found list (repeat): product selection cards.
149. Recovery found (repeat): "We found your Hatch (Recovery)" with CTA.
150. Wi-Fi password entry (repeat): same as 20 with keyboard.
151. Wi-Fi password entry (repeat): same as 21 without keyboard.
