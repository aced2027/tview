# Requirements Document

## Introduction

This document specifies requirements for a Bar Replay platform that enables traders to practice trading strategies by replaying historical market data candle-by-candle. The platform competes with TradingView's paywalled Bar Replay feature by offering a freemium model with support for Forex (via Polygon.io) and Crypto (via Binance REST API). The system extends an existing React + TypeScript trading platform with replay-specific functionality.

## Glossary

- **Replay_Engine**: The core service that manages historical candle playback, timing control, and state management
- **Candle**: An OHLCV (Open, High, Low, Close, Volume) data point representing price action over a specific time interval
- **Replay_Session**: A stateful instance of historical data playback from a specific start date with configurable speed and symbol
- **Replay_Controls**: UI components that allow users to play, pause, step forward/backward, and adjust playback speed
- **Timeframe**: The interval duration for candles (e.g., 1m, 5m, 15m, 1h, 4h, 1d)
- **Playback_Speed**: A multiplier (1x, 2x, 4x, 8x, 16x, 32x, 64x) that controls how fast candles are revealed
- **Historical_Buffer**: Pre-loaded candle data stored in memory for efficient replay operations
- **Tier**: User subscription level (Free or Pro) that determines feature access limits
- **Symbol**: A tradable instrument identifier (e.g., EURUSD, BTCUSDT)
- **Chart_Component**: The Lightweight Charts v4 visualization that displays candles
- **Drawing_Tool**: Interactive chart annotation (trendline, horizontal line, rectangle, etc.)
- **Indicator**: Technical analysis calculation displayed on the chart (MA, EMA, RSI, MACD, Bollinger Bands)
- **Layout**: A saved configuration of chart settings, indicators, and drawing tools
- **Auth_Service**: Supabase-based authentication system using Google OAuth
- **Billing_Service**: Stripe integration for subscription management
- **Data_Provider**: External API service (Polygon.io for Forex, Binance for Crypto) that supplies historical candle data

## Requirements

### Requirement 1: Replay Engine Core

**User Story:** As a trader, I want a replay engine that drip-feeds historical candles one at a time, so that I can practice trading in a realistic time-compressed environment.

#### Acceptance Criteria

1. THE Replay_Engine SHALL maintain a Historical_Buffer containing all candles from the selected start date to the present
2. WHEN the user starts playback, THE Replay_Engine SHALL emit candles at intervals determined by the Playback_Speed
3. WHEN Playback_Speed is 1x, THE Replay_Engine SHALL emit one candle per real-world second
4. WHEN Playback_Speed is Nx (where N > 1), THE Replay_Engine SHALL emit one candle every (1000/N) milliseconds
5. THE Replay_Engine SHALL expose current replay state including current candle index, playback status, and visible candle count
6. WHEN a new candle is emitted, THE Replay_Engine SHALL notify all subscribed components
7. THE Replay_Engine SHALL support pausing and resuming without data loss or state corruption

### Requirement 2: Replay Session Management

**User Story:** As a trader, I want to configure replay sessions with specific symbols, timeframes, and start dates, so that I can practice on relevant market conditions.

#### Acceptance Criteria

1. WHEN the user selects a Symbol and Timeframe, THE Replay_Engine SHALL load historical candles from the Data_Provider
2. WHEN the user selects a start date, THE Replay_Engine SHALL initialize the Historical_Buffer starting from that date
3. THE Replay_Engine SHALL validate that the requested start date is within the user's Tier limits (1 year for Free, 5+ years for Pro)
4. IF the start date exceeds Tier limits, THEN THE Replay_Engine SHALL return an error message indicating the limitation
5. THE Replay_Engine SHALL support changing Symbol or Timeframe, which SHALL reset the Replay_Session
6. WHEN a Replay_Session is reset, THE Replay_Engine SHALL clear the Historical_Buffer and reload data from the new configuration

### Requirement 3: Replay Controls UI

**User Story:** As a trader, I want intuitive playback controls, so that I can easily navigate through historical data.

#### Acceptance Criteria

1. THE Replay_Controls SHALL display play, pause, step forward, and step backward buttons
2. WHEN the user clicks play, THE Replay_Engine SHALL begin emitting candles at the current Playback_Speed
3. WHEN the user clicks pause, THE Replay_Engine SHALL stop emitting candles and preserve the current position
4. WHEN the user clicks step forward, THE Replay_Engine SHALL emit exactly one candle and remain paused
5. WHEN the user clicks step backward, THE Replay_Engine SHALL remove the most recent candle from the visible set and remain paused
6. THE Replay_Controls SHALL display the current candle timestamp and total candle count
7. THE Replay_Controls SHALL disable step backward when at the first candle
8. THE Replay_Controls SHALL disable step forward and play when at the last candle

### Requirement 4: Playback Speed Control

**User Story:** As a trader, I want to adjust replay speed, so that I can practice at different time compressions based on my strategy timeframe.

#### Acceptance Criteria

1. THE Replay_Controls SHALL display a speed selector with options: 1x, 2x, 4x, 8x, 16x, 32x, 64x
2. WHERE the user has a Free Tier, THE Replay_Controls SHALL limit speed options to 1x, 2x, 4x
3. WHERE the user has a Pro Tier, THE Replay_Controls SHALL enable all speed options up to 64x
4. WHEN the user changes Playback_Speed during playback, THE Replay_Engine SHALL adjust the emission interval without pausing
5. THE Replay_Engine SHALL maintain accurate timing at all supported speeds with less than 50ms drift per minute

### Requirement 5: Chart Integration

**User Story:** As a trader, I want the replay engine to integrate seamlessly with the existing chart component, so that I see candles appear progressively as in real trading.

#### Acceptance Criteria

1. WHEN the Replay_Engine emits a new candle, THE Chart_Component SHALL append it to the visible dataset
2. THE Chart_Component SHALL auto-scroll to keep the most recent candle visible during playback
3. WHEN the user manually scrolls the chart during playback, THE Chart_Component SHALL stop auto-scrolling until the user scrolls back to the latest candle
4. THE Chart_Component SHALL render replay candles identically to live candles (same colors, styling, and interactions)
5. WHEN the Replay_Session is reset, THE Chart_Component SHALL clear all visible candles

### Requirement 6: Symbol and Timeframe Selection

**User Story:** As a trader, I want to select different symbols and timeframes, so that I can practice on various instruments and trading styles.

#### Acceptance Criteria

1. THE Replay_Controls SHALL display a symbol selector with available instruments
2. WHERE the user has a Free Tier, THE Replay_Controls SHALL limit symbol selection to 5 symbols
3. WHERE the user has a Pro Tier, THE Replay_Controls SHALL enable selection from 50+ symbols
4. THE Replay_Controls SHALL display a timeframe selector with options: 1m, 5m, 15m, 30m, 1h, 4h, 1d
5. WHEN the user changes Symbol or Timeframe, THE Replay_Engine SHALL reset the Replay_Session and reload data
6. THE Replay_Controls SHALL display a loading indicator while data is being fetched from the Data_Provider

### Requirement 7: Date Picker for Replay Start

**User Story:** As a trader, I want to choose a specific start date for replay, so that I can practice on historical events or specific market conditions.

#### Acceptance Criteria

1. THE Replay_Controls SHALL display a date picker that allows selection of any date within the user's Tier limits
2. WHEN the user selects a start date, THE Replay_Engine SHALL load candles starting from 00:00 UTC on that date
3. THE Date_Picker SHALL disable dates outside the user's Tier limits (1 year for Free, 5+ years for Pro)
4. THE Date_Picker SHALL disable future dates
5. WHEN the user changes the start date, THE Replay_Engine SHALL reset the Replay_Session and reload data from the new start date

### Requirement 8: Drawing Tools Integration

**User Story:** As a trader, I want to use drawing tools during replay, so that I can mark support/resistance levels and trendlines as I would in live trading.

#### Acceptance Criteria

1. THE Chart_Component SHALL support trendline drawing during replay
2. THE Chart_Component SHALL support horizontal line drawing during replay
3. THE Chart_Component SHALL support rectangle drawing during replay
4. WHEN the user draws on the chart, THE Drawing_Tool SHALL only interact with visible candles (not future data)
5. WHEN the Replay_Session is reset, THE Chart_Component SHALL clear all drawings unless the user has saved the Layout
6. WHERE the user has a Pro Tier, THE Chart_Component SHALL enable all drawing tools
7. WHERE the user has a Free Tier, THE Chart_Component SHALL limit drawing tools to trendlines and horizontal lines

### Requirement 9: Technical Indicators Integration

**User Story:** As a trader, I want to apply technical indicators during replay, so that I can practice using indicator-based strategies.

#### Acceptance Criteria

1. THE Chart_Component SHALL support adding Moving Average (MA) indicators during replay
2. THE Chart_Component SHALL support adding Exponential Moving Average (EMA) indicators during replay
3. THE Chart_Component SHALL support adding Relative Strength Index (RSI) indicators during replay
4. THE Chart_Component SHALL support adding MACD indicators during replay
5. THE Chart_Component SHALL support adding Bollinger Bands indicators during replay
6. WHEN a new candle is emitted, THE Indicator SHALL recalculate using only visible candles (not future data)
7. WHERE the user has a Free Tier, THE Chart_Component SHALL limit indicators to MA and EMA only
8. WHERE the user has a Pro Tier, THE Chart_Component SHALL enable all indicators

### Requirement 10: User Authentication and Tier Management

**User Story:** As a platform operator, I want to authenticate users and enforce tier-based limits, so that I can monetize the platform with a freemium model.

#### Acceptance Criteria

1. THE Auth_Service SHALL authenticate users via Google OAuth using Supabase
2. WHEN a user logs in, THE Auth_Service SHALL retrieve the user's Tier from the database
3. THE Auth_Service SHALL expose the current user's Tier to all components that enforce limits
4. WHEN an unauthenticated user accesses the platform, THE Auth_Service SHALL default to Free Tier limits
5. THE Auth_Service SHALL maintain session state across page refreshes
6. WHEN a user's subscription changes, THE Auth_Service SHALL update the Tier in real-time without requiring re-login

### Requirement 11: Subscription and Billing

**User Story:** As a user, I want to upgrade to Pro tier, so that I can access advanced features and historical data.

#### Acceptance Criteria

1. THE Billing_Service SHALL integrate with Stripe for subscription management
2. THE Billing_Service SHALL offer a Pro subscription at $12 per month
3. WHEN a user subscribes to Pro, THE Billing_Service SHALL update the user's Tier in the database
4. WHEN a user cancels their subscription, THE Billing_Service SHALL downgrade the user to Free Tier at the end of the billing period
5. THE Billing_Service SHALL handle failed payments by notifying the user and suspending Pro features after 7 days
6. THE Billing_Service SHALL provide a subscription management page where users can view status, update payment methods, and cancel

### Requirement 12: Saved Layouts (Pro Feature)

**User Story:** As a Pro user, I want to save my chart layouts, so that I can quickly restore my preferred indicator and drawing configurations.

#### Acceptance Criteria

1. WHERE the user has a Pro Tier, THE Chart_Component SHALL display a "Save Layout" button
2. WHEN the user clicks "Save Layout", THE Chart_Component SHALL serialize the current indicators, drawings, and chart settings
3. THE Chart_Component SHALL store the Layout in the database associated with the user's account
4. THE Chart_Component SHALL display a "Load Layout" dropdown showing all saved layouts
5. WHEN the user selects a saved Layout, THE Chart_Component SHALL restore all indicators, drawings, and settings
6. THE Chart_Component SHALL support deleting saved layouts
7. WHERE the user has a Free Tier, THE Chart_Component SHALL hide layout save/load functionality

### Requirement 13: Data Provider Integration - Forex

**User Story:** As a trader, I want to replay Forex data, so that I can practice currency pair trading strategies.

#### Acceptance Criteria

1. THE Data_Provider SHALL fetch historical Forex candles from Polygon.io API
2. WHEN the user selects a Forex Symbol, THE Data_Provider SHALL request candles with the specified Timeframe and start date
3. THE Data_Provider SHALL handle API rate limits by queuing requests and retrying with exponential backoff
4. IF the Polygon.io API returns an error, THEN THE Data_Provider SHALL display an error message to the user
5. THE Data_Provider SHALL cache fetched candles in memory to avoid redundant API calls during the same session
6. THE Data_Provider SHALL support major Forex pairs: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF, NZDUSD

### Requirement 14: Data Provider Integration - Crypto

**User Story:** As a trader, I want to replay Crypto data, so that I can practice cryptocurrency trading strategies.

#### Acceptance Criteria

1. THE Data_Provider SHALL fetch historical Crypto candles from Binance REST API
2. WHEN the user selects a Crypto Symbol, THE Data_Provider SHALL request candles with the specified Timeframe and start date
3. THE Data_Provider SHALL handle API rate limits by queuing requests and retrying with exponential backoff
4. IF the Binance API returns an error, THEN THE Data_Provider SHALL display an error message to the user
5. THE Data_Provider SHALL cache fetched candles in memory to avoid redundant API calls during the same session
6. THE Data_Provider SHALL support major Crypto pairs: BTCUSDT, ETHUSDT, BNBUSDT, ADAUSDT, SOLUSDT, XRPUSDT

### Requirement 15: Replay State Persistence

**User Story:** As a trader, I want my replay session to persist across page refreshes, so that I don't lose my progress during practice.

#### Acceptance Criteria

1. WHEN the user refreshes the page during a Replay_Session, THE Replay_Engine SHALL restore the session state from browser storage
2. THE Replay_Engine SHALL persist the current Symbol, Timeframe, start date, current candle index, and Playback_Speed
3. THE Replay_Engine SHALL persist the playback status (playing or paused)
4. WHEN the Replay_Engine restores a session, THE Chart_Component SHALL display all previously visible candles
5. THE Replay_Engine SHALL clear persisted state when the user explicitly resets the Replay_Session

### Requirement 16: Performance and Responsiveness

**User Story:** As a trader, I want the replay engine to perform smoothly at high speeds, so that I can efficiently practice on large datasets.

#### Acceptance Criteria

1. THE Replay_Engine SHALL emit candles at 64x speed (approximately 16 candles per second) without frame drops
2. THE Chart_Component SHALL render up to 10,000 visible candles without performance degradation
3. THE Replay_Engine SHALL load and buffer 1 year of 1-minute candles (approximately 525,000 candles) within 5 seconds
4. THE Chart_Component SHALL respond to user interactions (zoom, pan, drawing) within 100ms during active playback
5. THE Replay_Engine SHALL use Web Workers for candle emission to avoid blocking the main UI thread

### Requirement 17: Error Handling and User Feedback

**User Story:** As a trader, I want clear error messages when issues occur, so that I can understand and resolve problems quickly.

#### Acceptance Criteria

1. IF the Data_Provider fails to fetch candles, THEN THE Replay_Engine SHALL display an error message with the failure reason
2. IF the user's Tier limits are exceeded, THEN THE Replay_Controls SHALL display a message explaining the limitation and offering an upgrade option
3. IF the Historical_Buffer is empty, THEN THE Replay_Controls SHALL disable play and step controls and display "No data available"
4. WHEN the Replay_Engine encounters an unexpected error, THE Replay_Engine SHALL log the error to the console and display a generic error message to the user
5. THE Replay_Engine SHALL recover gracefully from transient errors by retrying operations up to 3 times before failing

### Requirement 18: Keyboard Shortcuts

**User Story:** As a trader, I want keyboard shortcuts for replay controls, so that I can navigate efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN the user presses the spacebar, THE Replay_Engine SHALL toggle between play and pause
2. WHEN the user presses the right arrow key, THE Replay_Engine SHALL step forward one candle
3. WHEN the user presses the left arrow key, THE Replay_Engine SHALL step backward one candle
4. WHEN the user presses number keys 1-7, THE Replay_Engine SHALL set Playback_Speed to 1x, 2x, 4x, 8x, 16x, 32x, 64x respectively (subject to Tier limits)
5. THE Replay_Controls SHALL display a keyboard shortcuts help tooltip when the user hovers over control buttons

### Requirement 19: Mobile Responsiveness (Future Consideration)

**User Story:** As a trader, I want to use the replay platform on mobile devices, so that I can practice on the go.

#### Acceptance Criteria

1. THE Replay_Controls SHALL adapt to mobile screen sizes with touch-friendly button sizing (minimum 44x44px)
2. THE Chart_Component SHALL support touch gestures for zoom and pan during replay
3. THE Date_Picker SHALL use native mobile date pickers for better UX
4. THE Replay_Controls SHALL stack vertically on screens narrower than 768px
5. THE Chart_Component SHALL maintain 60fps performance on modern mobile devices (iPhone 12+, equivalent Android)

### Requirement 20: Analytics and Usage Tracking

**User Story:** As a platform operator, I want to track feature usage, so that I can optimize the product and understand conversion patterns.

#### Acceptance Criteria

1. THE Replay_Engine SHALL log replay session starts with Symbol, Timeframe, and Tier information
2. THE Replay_Engine SHALL log total replay duration and candle count per session
3. THE Billing_Service SHALL track conversion events when Free users upgrade to Pro
4. THE Replay_Controls SHALL track which features trigger Tier limit messages (to identify upgrade friction points)
5. THE Analytics_Service SHALL respect user privacy by anonymizing all tracked data and providing an opt-out mechanism
