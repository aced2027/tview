# ✅ Testing Checklist - State Persistence & Performance

**Last Updated**: April 13, 2026  
**Environment**: localhost:5173

## 🧪 Test 1: Basic State Persistence

### Steps:
1. Open http://localhost:5173 in browser
2. Select **EURUSD** from watchlist
3. Click **4h** timeframe
4. Wait for chart to load and stabilize
5. Press **F5** to reload the page
6. Observe: Chart should load **EURUSD 4h** automatically

### ✅ Expected Result:
- Chart loads with EURUSD pair and 4h timeframe
- No need to reselect manually
- Candles display correctly

### 📋 Verification:
- [ ] Pair stays as EURUSD after reload
- [ ] Timeframe stays as 4h after reload
- [ ] Chart shows correct candles for EURUSD 4h
- [ ] No "undefined" errors in console

---

## 🧪 Test 2: Per-Pair Customization

### Steps:
1. Start at EURUSD (if from Test 1)
2. Switch to **GBPUSD** 
3. Click **1d** timeframe
4. Wait for chart to load
5. Switch to **AUDUSD**
6. Click **1h** timeframe
7. Wait for chart to load
8. Reload page (F5)

### ✅ Expected Result:
- After reload, shows AUDUSD 1h (last selection)
- Browser localStorage shows: `{"symbol":"AUDUSD","timeframe":"1h"}`

### 📋 Verification:
- [ ] AUDUSD pair selected after reload
- [ ] 1h timeframe selected after reload
- [ ] Chart displays correct candles
- [ ] Previous selections (EURUSD 4h, GBPUSD 1d) not shown

---

## 🧪 Test 3: Performance - First Load

### Steps:
1. Open DevTools: Press **F12**
2. Go to **Console** tab
3. Open http://localhost:5173 fresh (ignore reload)
4. Observe console timing messages
5. Allow chart to fully render
6. Check messages like: `"✓ Loaded XXX candles in XXms"`

### ✅ Expected Result:
- Initial load completes in **<200ms**
- Console shows timing metrics

### 📋 Verification:
- [ ] Timing message appears in console
- [ ] Load time is under 200ms
- [ ] Chart renders and displays candles
- [ ] No red errors (warnings OK)

### 📊 Performance Expectations:
```
Initial load: 50-150ms (cold cache)
Cached load: <10ms (hot cache)
Chart render: 20-40ms
Total visible: <200ms
```

---

## 🧪 Test 4: Performance - Cached Loads

### Steps:
1. Keep DevTools Console open from Test 3
2. Switch to different pair: Click **GBPUSD**
3. Each switch should log timing
4. Notice cache message: `"✓ Loaded XXX candles in Xms"`
5. After 2-3 switches, most loads should say "cache" or show <10ms

### ✅ Expected Result:
- Subsequent loads much faster (<10ms) if data loaded before
- First load of a new pair: 50-100ms
- All loads complete <100ms

### 📋 Verification:
- [ ] First pair switch slower (50-100ms)
- [ ] Second pair switch faster if repeated (<10ms)
- [ ] All loads complete <100ms
- [ ] Chart updates smoothly without flickering

---

## 🧪 Test 5: Multiple Pairs at Different Timeframes

### Steps:
1. Open DevTools Console (F12)
2. Test this sequence:
   - AUDUSD + 1h → Wait for load
   - EURUSD + 4h → Wait for load
   - GBPUSD + 1d → Wait for load
   - AUDUSD + 1h → Should load instantly (cached)
   - EURUSD + 1d → Note: Different timeframe, will load fresh
3. Reload page (F5)
4. Verify last pair loaded: EURUSD 1d

### ✅ Expected Result:
- Each pair/timeframe combo loads correctly
- Repeat of AUDUSD 1h faster
- Browser remembers EURUSD 1d after reload

### 📋 Verification:
- [ ] All pairs load with correct candles
- [ ] Candles match pair name (AUDUSD shows AU prices, etc.)
- [ ] Repeat pair loads faster than first load
- [ ] After reload, EURUSD 1d displayed
- [ ] Search localStorage: `{"symbol":"EURUSD","timeframe":"1d"}`

---

## 🧪 Test 6: Loading UI & Spinner

### Steps:
1. Open Chart app at http://localhost:5173
2. Quickly click different pairs rapidly (5-10 clicks)
3. Watch for loading spinner
4. Observe spinner should only appear briefly if data loading

### ✅ Expected Result:
- Loading spinner appears briefly during load
- Spinner has animation (spinning effect)
- Disappears quickly (usually <100ms)
- Chart smoothly updates

### 📋 Verification:
- [ ] Spinner visible during load
- [ ] Spinner animates (not frozen)
- [ ] Background blurs when loading
- [ ] Spinner disappears quickly
- [ ] Chart displays candles when done

---

## 🧪 Test 7: Console Diagnostics

### Steps:
1. Open DevTools Console (F12)
2. Type: `localStorage.getItem('chart_state')`
3. Press Enter
4. Observe output
5. Should show JSON like: `{"symbol":"EURUSD","timeframe":"4h"}`

### ✅ Expected Result:
```javascript
> localStorage.getItem('chart_state')
< {"symbol":"EURUSD","timeframe":"4h"}
```

### 📋 Verification:
- [ ] Command returns JSON object (not null)
- [ ] JSON contains "symbol" key with pair name
- [ ] JSON contains "timeframe" key with timeframe
- [ ] Values match what's displayed in chart

---

## 🧪 Test 8: Browser Close & Reopen

### Steps:
1. Select GBPUSD + 1d (or any pair/timeframe)
2. Close the browser completely
3. Reopen browser
4. Navigate to http://localhost:5173
5. Observe which pair/timeframe loads

### ✅ Expected Result:
- Chart loads GBPUSD 1d (your selection before close)
- localStorage persisted across browser sessions
- Chart renders correctly

### 📋 Verification:
- [ ] Correct pair displayed after browser restart
- [ ] Correct timeframe displayed
- [ ] Candles render properly
- [ ] No errors in console

---

## 🧪 Test 9: Data Accuracy

### Steps:
1. Select EURUSD + 1h
2. Look at first candle:
   - Time shown (left Y-axis)
   - Open/Close prices (candle height)
3. Select same pair, different timeframe (EURUSD + 4h)
4. Verify 4h candel at same time range shows similar pattern

### ✅ Expected Result:
- Candles show reasonable price ranges for EUR/USD
- Multiple timeframes of same pair show consistent patterns
- Times progress left-to-right

### 📋 Verification:
- [ ] Candles display for correct pair
- [ ] Time axis shows dates
- [ ] Price axis shows reasonable forex prices
- [ ] Different timeframes show compatible data
- [ ] No NaN or undefined values visible

---

## 🧪 Test 10: Error Tolerance

### Steps:
1. Open DevTools (F12) → Network tab
2. Switch pairs and observe network requests
3. Try switching to multiple pairs rapidly
4. Watch for any failed requests (red)

### ✅ Expected Result:
- All network requests succeed (HTTP 200)
- Even if rapid switches, no errors
- Chart updates correctly each time

### 📋 Verification:
- [ ] No red network requests
- [ ] All candle files load (Status 200)
- [ ] No console errors (warnings OK)
- [ ] Chart never breaks or freezes

---

## 📊 Performance Summary Table

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| First Load (cold cache) | <100ms | ? | ⏳ |
| Cached Load (hot) | <10ms | ? | ⏳ |
| Chart Render | <50ms | ? | ⏳ |
| State Restore | Instant | ? | ⏳ |
| Total Visible Time | <200ms | ? | ⏳ |
| Memory Usage | <300MB | ? | ⏳ |
| Cache Hit Rate | >80% | ? | ⏳ |

---

## 🎯 Success Criteria

### ✅ All tests PASS when:
1. State persists across page reloads
2. Correct data displays for each pair/timeframe
3. Initial load <200ms, cached loads <10ms
4. Loading UI appears and disappears smoothly
5. No errors in console
6. Browser localStorage tracks selections
7. All 7 pairs load correctly with data
8. Rapid switching doesn't cause errors

### ⚠️ Known Limitations:
- First app load (cold cache) slower (~150ms)
- Very first load of any pair slower (~50-100ms)
- All other loads should be <10ms
- Cache expires after 1 hour of inactivity

---

## 🐛 Troubleshooting

### Issue: Pair/timeframe not remembered after reload
**Solution**:
1. Check DevTools: `localStorage.getItem('chart_state')`
2. Should show JSON with your selection
3. If empty, localStorage might be disabled
4. Try different browser to verify

### Issue: Chart loads very slowly (>500ms)
**Solution**:
1. Check Network tab in DevTools
2. Verify candle files are downloaded
3. Check if candles are large (>2MB)
4. Try hard refresh (Ctrl+Shift+R)

### Issue: If data seems wrong
**Solution**:
1. Open DevTools Console
2. Clear cache manually: localStorage.clear()
3. Reload page
4. Try again with fresh start

---

## 📝 Notes for Developers

**Console Log Examples** You Should See:
```
[chartStore] Initialized from localStorage
[chartStore] Current state: EURUSD @ 1h
[main] Preloading AUDUSD, EURUSD...
[candles] ✓ Loaded AUDUSD 1h: 101,802 candles in 45.23ms
[candles] ✓ Loaded EURUSD 4h: 26,928 candles in 38.14ms
[ChartContainer] ✓ Updated chart for EURUSD @ 1h (1,719 candles)
[main] Preload complete in 127.34ms
```

**Browser Storage Limit**: 
- localStorage: 5-10MB per origin (plenty for our JSON)
- Session Cache: RAM limited (depends on device)

---

**Created**: April 13, 2026  
**Status**: Ready for Testing ✅  
**Expected Duration**: 15-20 minutes for full suite
