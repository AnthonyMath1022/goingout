# Mobile interface test report

Tested on 11 September 2026 using installed Chrome 152 in headless mode with mobile viewport and touch emulation, against the two local HTML pages. This is browser emulation, not a physical Android/iPhone or Safari test. Website source files were not changed.

## Coverage and results

| Viewport | Proposal fits horizontally | Itinerary fits horizontally | Yes navigation | Image/audio | Map |
|---|---|---|---|---|---|
| 320 × 568 | Pass | Pass | Pass | Pass | 5 markers loaded |
| 360 × 800 | Pass | Pass | Pass | Pass | 5 markers loaded |
| 390 × 844 | Pass | Pass | Pass | Pass | 5 markers loaded |
| 430 × 932 | Pass | Pass | Pass | Pass | 5 markers loaded |
| 844 × 390, landscape | Pass | Pass | Pass | Pass | 5 markers loaded |

The first No tap moves the button and starts audio playback. Playback pauses and resets after the 700 ms inactivity timer (checked at 850 ms). The Yes and No targets are about 87 × 55 and 85 × 54 CSS pixels. Rotating the viewport restores the No button to its original button row. All six itinerary stops render, Day 1 redraws the list, and the print button invokes `window.print` (intercepted for this test; actual print dialog/output was not tested). No uncaught JavaScript errors or failed network requests occurred during the completed online matrix. Blocking external requests still renders all six stops and a map-unavailable message.

## Findings

### 1. No button can stop dodging after its first escape — medium

**Reproduce:** Open the proposal, tap No, then repeatedly tap the center of its new position.

**Actual:** The button remains at `left:100px; top:100px` for all 12 subsequent taps at each of the five sizes. Each tap opens “Nice Try”.

**Cause:** Near-center touches produce a large displacement through `safeDistance`; the edge-wrap logic sends both coordinates back to 100. It can therefore choose exactly the current position. The click handler subsequently reaches the catch branch. See `dating(yes or no).html:137`, `:157`, and `:172`.

**Suggested fix:** Ensure each escape chooses an in-bounds destination outside the current touch area, including a fallback when wrapping would keep the same position. Test center and edge taps.

### 2. Tapping a stop opens its popup offscreen — medium

**Reproduce:** In portrait, scroll to KLCC Park and tap its title.

**Actual:** The map pans and opens the correct popup, but the map remains above the screen. At 390 × 844 its bottom is 225 pixels above the visible viewport. The result looks like the tap did nothing.

**Cause:** The handler only calls `map.panTo` and `marker.openPopup`; the portrait layout puts the map above the itinerary. See `Kuala Lumpur-itinerary (2).html:58`.

**Suggested fix:** On the stacked mobile layout, scroll the map into view after selecting a stop, or show the selected location beside the tapped card.

### 3. Itinerary controls have small touch targets — low

Measured heights: stop-title buttons 26 px; Day 1 35 px; Print this day 37 px; map zoom controls 30 px. Increase target height/padding to roughly 44–48 px for easier tapping. This is a usability recommendation, not a claimed accessibility-standard violation.

### 4. Small-screen itinerary header wraps awkwardly — low

At 320 and 360 px wide, “SHARED ITINERARY · READ ONLY” starts immediately beside the print button, then wraps below it. Give the print button and label separate rows on narrow screens. See the itinerary screenshots.

Additional map touch check at 390 × 844: tapping marker 1 selects the Parliament of Malaysia card and opens its matching popup. Zoom-in loads level 14 tiles; zoom-out returns to level 13. See [map interaction measurements](map-check.json).

## Evidence

- [320 px proposal](proposal-320x568.png)
- [390 px proposal](proposal-390x844.png)
- [320 px itinerary](itinerary-320x568.png)
- [390 px viewport after tapping KLCC Park](stop-tap-390x844.png)
- [Landscape itinerary](itinerary-844x390.png)
- [Full measurements](results.json)
- [Test script](test.cjs)

Limitations: physical-device safe areas, real browser address-bar resizing, actual iOS audio policy, audible output quality, pinch gestures, and print rendering were not checked. Tests use local file URLs rather than a deployed server.
