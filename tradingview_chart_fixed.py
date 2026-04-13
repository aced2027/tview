"""
TradingView-Style Interactive Candlestick Chart - FIXED VERSION
================================================================

Features:
- Candlestick rendering (bull=green, bear=red)
- Scroll wheel zoom (minimize / maximize candle view)
- Click + drag to pan left/right
- Price axis drag to stretch/compress price scale
- Time axis drag to scroll
- Crosshair with price & date labels
- OHLC toolbar at the top
- Auto price-range fitting
- FIXED: Responsive time and price axis interactions

Requirements:
pip install pygame

Run:
python tradingview_chart_fixed.py
"""

import pygame
import math
import random
import datetime

# ── Colours ────────────────────────────────────────────────────────────────
BG          = (19,  23,  34)
PANEL       = (30,  34,  45)
GRID        = (30,  34,  45)
BULL        = (38, 166, 154)
BEAR        = (239, 83,  80)
AXIS_TXT    = (120, 123, 134)
CROSS_COL   = (117, 134, 150)
WHITE       = (209, 212, 220)
TAG_BG      = (19,  23,  34)
TAG_BORDER  = (67,  70,  81)
TOOLBAR_BG  = (30,  34,  45)
TOOLBAR_SEP = (42,  46,  57)
LAST_PRICE  = (38, 166, 154)
HOVER_BG    = (42,  46,  57)

# ── Layout ─────────────────────────────────────────────────────────────────
PRICE_AXIS_W = 80
TIME_AXIS_H  = 35
TOOLBAR_H    = 40
MIN_VIS      = 5

# ── Data generation ─────────────────────────────────────────────────────────
def gen_candles(n=120, base=1.17, vol=0.005):
    candles = []
    price = base
    t = datetime.date(2026, 1, 2)
    
    for _ in range(n):
        o = price
        rng = vol * (0.5 + random.random())
        up  = random.random() > 0.48
        c   = o + (1 if up else -1) * rng * (0.3 + random.random() * 0.7)
        h   = max(o, c) + rng * random.random() * 0.5
        l   = min(o, c) - rng * random.random() * 0.5
        
        candles.append({
            "t": t, 
            "o": round(o, 5), 
            "h": round(h, 5),
            "l": round(l, 5), 
            "c": round(c, 5)
        })
        
        price = c
        t += datetime.timedelta(days=1)
    
    return candles

class TradingChart:
    def __init__(self, width=1200, height=700):
        pygame.init()
        self.W = width
        self.H = height
        self.screen = pygame.display.set_mode((width, height), pygame.RESIZABLE)
        pygame.display.set_caption("EUR/USD — TradingView Style Chart (Fixed)")
        
        # Fonts
        self.font_sm  = pygame.font.SysFont("Arial", 11)
        self.font_med = pygame.font.SysFont("Arial", 14, bold=True)
        self.font_tag = pygame.font.SysFont("Arial", 12, bold=True)
        
        # Data
        self.candles   = gen_candles(200)
        self.vis_start = 80
        self.vis_count = 60
        
        # Price viewport
        self.price_min = 0.0
        self.price_max = 0.0
        self._calc_price_range()
        
        # Interaction state
        self.dragging       = False
        self.drag_start_x   = 0
        self.drag_vis_start = 0
        
        self.price_drag     = False
        self.price_drag_y   = 0
        self.price_drag_min = 0.0
        self.price_drag_max = 0.0
        
        self.time_drag      = False
        self.time_drag_x    = 0
        self.time_drag_vis  = 0
        
        # Crosshair
        self.cross_x = -1
        self.cross_y = -1
        
        # Hover states for better UX
        self.price_axis_hover = False
        self.time_axis_hover = False
        
        self.clock = pygame.time.Clock()

    # ── Helpers ────────────────────────────────────────────────────────────
    @property
    def chart_rect(self):
        """Returns (x, y, w, h) of the main candlestick area."""
        return (0, TOOLBAR_H, self.W - PRICE_AXIS_W, self.H - TOOLBAR_H - TIME_AXIS_H)
    
    def _chart_w(self):  
        return self.W - PRICE_AXIS_W
    
    def _chart_h(self):  
        return self.H - TOOLBAR_H - TIME_AXIS_H
    
    def _chart_top(self): 
        return TOOLBAR_H
    
    def _calc_price_range(self):
        end = min(self.vis_start + self.vis_count, len(self.candles))
        sl  = self.candles[self.vis_start:end]
        if not sl:
            return
        
        mn = min(c["l"] for c in sl)
        mx = max(c["h"] for c in sl)
        pad = (mx - mn) * 0.1
        self.price_min = mn - pad
        self.price_max = mx + pad
    
    def _to_y(self, price):
        ch = self._chart_h()
        if self.price_max == self.price_min:
            return self._chart_top() + ch / 2
        frac = (price - self.price_min) / (self.price_max - self.price_min)
        return self._chart_top() + ch - frac * ch
    
    def _to_price(self, y):
        ch = self._chart_h()
        if ch <= 0:
            return self.price_min
        frac = 1 - (y - self._chart_top()) / ch
        return self.price_min + frac * (self.price_max - self.price_min)
    
    def _candle_x(self, idx):
        if self.vis_count <= 0:
            return 0
        cw = self._chart_w() / self.vis_count
        return (idx - self.vis_start) * cw + cw / 2
    
    def _clamp_vis(self):
        self.vis_count = max(MIN_VIS, min(len(self.candles), self.vis_count))
        self.vis_start = max(0, min(len(self.candles) - self.vis_count, self.vis_start))

    # ── Drawing ────────────────────────────────────────────────────────────
    def _draw_toolbar(self, hover_idx):
        # Background
        pygame.draw.rect(self.screen, TOOLBAR_BG, (0, 0, self.W, TOOLBAR_H))
        pygame.draw.line(self.screen, TOOLBAR_SEP, (0, TOOLBAR_H-1), (self.W, TOOLBAR_H-1))
        
        # Symbol
        lbl = self.font_med.render("EUR/USD", True, WHITE)
        self.screen.blit(lbl, (15, 12))
        
        # OHLC values
        if 0 <= hover_idx < len(self.candles):
            c = self.candles[hover_idx]
            items = [
                ("O", f"{c['o']:.5f}", WHITE),
                ("H", f"{c['h']:.5f}", BULL),
                ("L", f"{c['l']:.5f}", BEAR),
                ("C", f"{c['c']:.5f}", WHITE)
            ]
        else:
            if self.candles:
                last = self.candles[-1]
                items = [
                    ("O", f"{last['o']:.5f}", WHITE),
                    ("H", f"{last['h']:.5f}", BULL),
                    ("L", f"{last['l']:.5f}", BEAR),
                    ("C", f"{last['c']:.5f}", WHITE)
                ]
            else:
                items = []
        
        x = 140
        for label, val, col in items:
            lsrf = self.font_sm.render(label + " ", True, AXIS_TXT)
            vsrf = self.font_sm.render(val + "  ", True, col)
            self.screen.blit(lsrf, (x, 14))
            self.screen.blit(vsrf, (x + lsrf.get_width(), 14))
            x += lsrf.get_width() + vsrf.get_width() + 12
        
        # Instructions
        inst_text = "Scroll: Zoom | Drag: Pan | Price/Time Axis: Interactive"
        inst = self.font_sm.render(inst_text, True, AXIS_TXT)
        self.screen.blit(inst, (self.W - inst.get_width() - 15, 14))
    
    def _draw_grid(self):
        cw, ch = self._chart_w(), self._chart_h()
        steps = 8
        
        # Horizontal lines
        for i in range(steps + 1):
            y = self._chart_top() + i * ch // steps
            pygame.draw.line(self.screen, GRID, (0, y), (cw, y))
        
        # Vertical lines
        v_steps = min(10, self.vis_count // 5)
        if v_steps > 0:
            for i in range(v_steps + 1):
                x = i * cw // v_steps
                pygame.draw.line(self.screen, GRID, (x, self._chart_top()), (x, self._chart_top() + ch))
    
    def _draw_candles(self):
        if self.vis_count <= 0:
            return
            
        cw_px = self._chart_w() / self.vis_count
        bw    = max(1, int(cw_px * 0.7))
        end   = min(self.vis_start + self.vis_count, len(self.candles))
        
        for i in range(self.vis_start, end):
            cd  = self.candles[i]
            x   = int(self._candle_x(i))
            bull = cd["c"] >= cd["o"]
            col  = BULL if bull else BEAR
            
            oy, cy = int(self._to_y(cd["o"])), int(self._to_y(cd["c"]))
            hy, ly = int(self._to_y(cd["h"])), int(self._to_y(cd["l"]))
            
            # Wick
            pygame.draw.line(self.screen, col, (x, hy), (x, ly), 2)
            
            # Body
            top = min(oy, cy)
            h   = max(2, abs(cy - oy))
            pygame.draw.rect(self.screen, col, (x - bw//2, top, bw, h))
    
    def _draw_last_price_line(self):
        if not self.candles:
            return
            
        visible_end = min(self.vis_start + self.vis_count - 1, len(self.candles) - 1)
        last = self.candles[visible_end]
        y = int(self._to_y(last["c"]))
        cw = self._chart_w()
        
        # Dashed line
        dash, gap, x = 6, 4, 0
        while x < cw:
            pygame.draw.line(self.screen, LAST_PRICE, (x, y), (min(x+dash, cw), y), 2)
            x += dash + gap
        
        # Price tag on axis
        tag = self.font_tag.render(f"{last['c']:.4f}", True, WHITE)
        tw, th = tag.get_size()
        px = self.W - PRICE_AXIS_W + 3
        pygame.draw.rect(self.screen, BULL, (px, y - th//2 - 3, PRICE_AXIS_W - 6, th + 6))
        pygame.draw.rect(self.screen, WHITE, (px, y - th//2 - 3, PRICE_AXIS_W - 6, th + 6), 1)
        self.screen.blit(tag, (px + 6, y - th//2))
    
    def _draw_price_axis(self):
        px = self.W - PRICE_AXIS_W
        ch = self._chart_h()
        
        # Background with hover effect
        bg_color = HOVER_BG if self.price_axis_hover else BG
        pygame.draw.rect(self.screen, bg_color, (px, TOOLBAR_H, PRICE_AXIS_W, ch))
        pygame.draw.line(self.screen, TOOLBAR_SEP, (px, TOOLBAR_H), (px, self.H - TIME_AXIS_H))
        
        # Price labels
        steps = 8
        for i in range(steps + 1):
            y = self._chart_top() + i * ch // steps
            price = self._to_price(y)
            txt = self.font_sm.render(f"{price:.4f}", True, AXIS_TXT)
            self.screen.blit(txt, (px + 6, y - 7))
        
        # Crosshair price tag
        if self.cross_y >= 0 and self.cross_x >= 0:
            price = self._to_price(self.cross_y)
            tag = self.font_tag.render(f"{price:.4f}", True, WHITE)
            tw, th = tag.get_size()
            by = self.cross_y - th//2 - 3
            pygame.draw.rect(self.screen, TAG_BG, (px + 2, by, PRICE_AXIS_W - 4, th + 6))
            pygame.draw.rect(self.screen, TAG_BORDER, (px + 2, by, PRICE_AXIS_W - 4, th + 6), 1)
            self.screen.blit(tag, (px + 6, self.cross_y - th//2))
    
    def _draw_time_axis(self):
        ty = self.H - TIME_AXIS_H
        cw = self._chart_w()
        
        # Background with hover effect
        bg_color = HOVER_BG if self.time_axis_hover else BG
        pygame.draw.rect(self.screen, bg_color, (0, ty, cw, TIME_AXIS_H))
        pygame.draw.line(self.screen, TOOLBAR_SEP, (0, ty), (cw, ty))
        
        # Time labels
        step = max(1, self.vis_count // 6)
        end  = min(self.vis_start + self.vis_count, len(self.candles))
        months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        
        for i in range(self.vis_start, end, step):
            cd  = self.candles[i]
            x   = int(self._candle_x(i))
            lbl = f"{months[cd['t'].month-1]} {cd['t'].day}"
            txt = self.font_sm.render(lbl, True, AXIS_TXT)
            self.screen.blit(txt, (x - txt.get_width()//2, ty + 10))
        
        # Crosshair date tag
        if self.cross_x >= 0 and self.cross_y >= 0:
            if cw > 0:
                idx = int(self.vis_start + (self.cross_x / cw) * self.vis_count)
                idx = max(0, min(len(self.candles)-1, idx))
                cd  = self.candles[idx]
                lbl = f"{months[cd['t'].month-1]} {cd['t'].day}, {cd['t'].year}"
                tag = self.font_tag.render(lbl, True, WHITE)
                tw, th = tag.get_size()
                bx = max(0, min(cw - tw - 8, self.cross_x - tw//2 - 4))
                pygame.draw.rect(self.screen, TAG_BG, (bx, ty + 2, tw + 8, TIME_AXIS_H - 4))
                pygame.draw.rect(self.screen, TAG_BORDER, (bx, ty + 2, tw + 8, TIME_AXIS_H - 4), 1)
                self.screen.blit(tag, (bx + 4, ty + 10))
    
    def _draw_crosshair(self):
        if self.cross_x < 0 or self.cross_y < 0:
            return
            
        cw, ch = self._chart_w(), self._chart_h()
        ct = self._chart_top()
        
        # Vertical line
        y0, y1 = ct, ct + ch
        x = self.cross_x
        dash, gap, y = 6, 4, y0
        while y < y1:
            pygame.draw.line(self.screen, CROSS_COL, (x, y), (x, min(y+dash, y1)), 2)
            y += dash + gap
        
        # Horizontal line
        x0, x1 = 0, cw
        y = self.cross_y
        x = x0
        while x < x1:
            pygame.draw.line(self.screen, CROSS_COL, (x, y), (min(x+dash, x1), y), 2)
            x += dash + gap

    # ── Event handling ─────────────────────────────────────────────────────
    def _hover_idx(self):
        if self.cross_x < 0 or self._chart_w() <= 0:
            return -1
        idx = int(self.vis_start + (self.cross_x / self._chart_w()) * self.vis_count)
        return max(0, min(len(self.candles)-1, idx))
    
    def handle_events(self):
        for e in pygame.event.get():
            if e.type == pygame.QUIT:
                return False
            
            elif e.type == pygame.VIDEORESIZE:
                self.W, self.H = e.w, e.h
                self.screen = pygame.display.set_mode((self.W, self.H), pygame.RESIZABLE)
                self._calc_price_range()
            
            # ── Scroll wheel zoom ──────────────────────────────────────
            elif e.type == pygame.MOUSEWHEEL:
                mx, my = pygame.mouse.get_pos()
                cw = self._chart_w()
                ct = self._chart_top()
                ch = self._chart_h()
                
                # Main chart area → horizontal zoom
                if mx < cw and ct < my < ct + ch:
                    factor = 0.85 if e.y > 0 else 1.18  # Reversed for intuitive zoom
                    old_count = self.vis_count
                    self.vis_count = int(self.vis_count * factor)
                    self._clamp_vis()
                    
                    # Keep zoom centered on mouse position
                    if old_count != self.vis_count:
                        mouse_ratio = mx / cw
                        count_diff = old_count - self.vis_count
                        self.vis_start += int(count_diff * mouse_ratio)
                        self._clamp_vis()
                    
                    self._calc_price_range()
                
                # Price axis → vertical scale
                elif mx >= cw:
                    rng    = self.price_max - self.price_min
                    center = (self.price_max + self.price_min) / 2
                    factor = 0.9 if e.y > 0 else 1.1
                    nr     = rng * factor / 2
                    self.price_min = center - nr
                    self.price_max = center + nr
                
                # Time axis → horizontal zoom
                elif my >= self.H - TIME_AXIS_H:
                    factor = 0.85 if e.y > 0 else 1.18
                    self.vis_count = int(self.vis_count * factor)
                    self._clamp_vis()
                    self._calc_price_range()
            
            # ── Mouse button down ──────────────────────────────────────
            elif e.type == pygame.MOUSEBUTTONDOWN and e.button == 1:
                mx, my = e.pos
                cw = self._chart_w()
                ct, ch = self._chart_top(), self._chart_h()
                
                if mx >= cw:                        # Price axis
                    self.price_drag     = True
                    self.price_drag_y   = my
                    self.price_drag_min = self.price_min
                    self.price_drag_max = self.price_max
                
                elif my >= self.H - TIME_AXIS_H:    # Time axis
                    self.time_drag   = True
                    self.time_drag_x  = mx
                    self.time_drag_vis = self.vis_start
                
                elif ct < my < ct + ch and mx < cw: # Main chart
                    self.dragging       = True
                    self.drag_start_x   = mx
                    self.drag_vis_start = self.vis_start
            
            elif e.type == pygame.MOUSEBUTTONUP and e.button == 1:
                self.dragging = self.price_drag = self.time_drag = False
            
            # ── Mouse move ─────────────────────────────────────────────
            elif e.type == pygame.MOUSEMOTION:
                mx, my = e.pos
                cw = self._chart_w()
                ct, ch = self._chart_top(), self._chart_h()
                
                # Update hover states
                self.price_axis_hover = (mx >= cw)
                self.time_axis_hover = (my >= self.H - TIME_AXIS_H)
                
                # Update crosshair only in chart area
                if mx < cw and ct <= my <= ct + ch:
                    self.cross_x = mx
                    self.cross_y = my
                else:
                    self.cross_x = self.cross_y = -1
                
                # Handle dragging
                if self.dragging and cw > 0:
                    dx    = mx - self.drag_start_x
                    shift = int(-dx / (cw / max(1, self.vis_count)))
                    self.vis_start = self.drag_vis_start + shift
                    self._clamp_vis()
                    self._calc_price_range()
                
                if self.price_drag:
                    dy     = my - self.price_drag_y
                    rng    = self.price_drag_max - self.price_drag_min
                    factor = 1 + dy * 0.003
                    center = (self.price_drag_max + self.price_drag_min) / 2
                    nr     = (rng * factor) / 2
                    self.price_min = center - nr
                    self.price_max = center + nr
                
                if self.time_drag and cw > 0:
                    dx = mx - self.time_drag_x
                    shift = int(-dx / (cw / max(1, self.vis_count)))
                    self.vis_start = self.time_drag_vis + shift
                    self._clamp_vis()
                    self._calc_price_range()
            
            # ── Keyboard shortcuts ────────────────────────────────────
            elif e.type == pygame.KEYDOWN:
                if e.key == pygame.K_PLUS or e.key == pygame.K_EQUALS:
                    self.vis_count = int(self.vis_count * 0.8)
                    self._clamp_vis()
                    self._calc_price_range()
                
                elif e.key == pygame.K_MINUS:
                    self.vis_count = int(self.vis_count * 1.25)
                    self._clamp_vis()
                    self._calc_price_range()
                
                elif e.key == pygame.K_LEFT:
                    self.vis_start = max(0, self.vis_start - 5)
                    self._calc_price_range()
                
                elif e.key == pygame.K_RIGHT:
                    self.vis_start = min(len(self.candles) - self.vis_count, self.vis_start + 5)
                    self._calc_price_range()
                
                elif e.key == pygame.K_r:       # Reset
                    self.vis_start = 80
                    self.vis_count = 60
                    self._calc_price_range()
                
                elif e.key == pygame.K_ESCAPE:
                    return False
        
        return True

    # ── Main loop ──────────────────────────────────────────────────────────
    def run(self):
        running = True
        while running:
            running = self.handle_events()
            
            # Clear screen
            self.screen.fill(BG)
            
            # Draw everything
            self._draw_grid()
            self._draw_candles()
            self._draw_last_price_line()
            self._draw_crosshair()
            self._draw_price_axis()
            self._draw_time_axis()
            self._draw_toolbar(self._hover_idx())
            
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()

if __name__ == "__main__":
    print("Starting TradingView-style chart...")
    print("Controls:")
    print("- Scroll wheel: Zoom in/out")
    print("- Click + drag chart: Pan left/right")
    print("- Click + drag price axis (right): Stretch/compress price scale")
    print("- Click + drag time axis (bottom): Scroll through time")
    print("- Hover over chart: Show crosshair with OHLC values")
    print("- +/- keys: Zoom in/out")
    print("- Arrow keys: Pan left/right")
    print("- R key: Reset view")
    print("- ESC: Exit")
    print()
    
    TradingChart(width=1200, height=700).run()