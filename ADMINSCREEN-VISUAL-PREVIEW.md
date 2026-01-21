# 🎨 AdminScreen Visual Preview

## Web Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                            CANDY SHOP ADMIN DASHBOARD                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌──────────────┬────────────────────────────────────────────────────────────┐
│              │                                                            │
│  SIDEBAR     │                     MAIN CONTENT                          │
│  (280px)     │                                                            │
│              │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ 🏪 CANDY     │  ┃ Chào mừng trở lại, Quản trị viên!          ┃  │
│    SHOP      │  ┃ Thứ 5, 19 tháng 1 năm 2025                 ┃  │
│    Admin     │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│              │                                                            │
│ ────────     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│              │  │      📦     │  │      🛒     │  │      👥     │       │
│ [📊 Tổng]   │  │   PRODUCTS  │  │   ORDERS    │  │  CUSTOMERS  │       │
│  quan        │  │    150      │  │    1,245    │  │    5,820    │       │
│              │  └─────────────┘  └─────────────┘  └─────────────┘       │
│ [🛒 Đơn]    │                                                            │
│  hàng        │  ┌─────────────┐                                          │
│              │  │      💰     │                                          │
│ [📦 Sản]    │  │   REVENUE   │                                          │
│  phẩm        │  │    125M     │                                          │
│              │  └─────────────┘                                          │
│ [🎟️ Vou]   │                                                            │
│  cher        │  ╔═══════════════════════════════════════════════╗        │
│              │  ║         QUICK ACTIONS (3 COLUMNS)            ║        │
│ [📢 Thông]  │  ╠═══════════════════════════════════════════════╣        │
│  báo         │  ║ ▌📊 DASHBOARD      ║ ▌🛒 ORDERS         ║ ▌📦 PRODUCTS ║
│              │  ║ Tổng quan          ║ Quản lý đơn hàng   ║ Quản lý sản phẩm ║
│ [📈 Thống]  │  ╠═══════════════════════════════════════════════╣        │
│  kê          │  ║ ▌🎟️ VOUCHERS     ║ ▌📢 NOTIFICATIONS  ║ ▌📈 STATISTICS  ║
│              │  ║ Quản lý voucher    ║ Gửi thông báo      ║ Xem thống kê  ║
│              │  ╚═══════════════════════════════════════════════╝        │
│              │                                                            │
│ ────────     │                                                            │
│              │                                                            │
│ [◀ Collapse] │                                                            │
│              │                                                            │
└──────────────┴────────────────────────────────────────────────────────────┘
```

---

## Color Coding

```
SIDEBAR MENU COLORS:
┌─────────────────────────────────────────┐
│ 🟪 #6366f1  Indigo  - Dashboard         │
│ 🟩 #10b981  Green   - Orders            │
│ 🟦 #3b82f6  Blue    - Products          │
│ 🟨 #f59e0b  Orange  - Vouchers          │
│ 🟥 #ec4899  Pink    - Notifications     │
│ 🟪 #8b5cf6  Purple  - Statistics        │
└─────────────────────────────────────────┘

BACKGROUND COLORS:
┌─────────────────────────────────────────┐
│ #f8fafc  Light gray - Main background   │
│ #ffffff  White      - Card backgrounds  │
│ #e2e8f0  Light gray - Borders           │
│ #1e293b  Dark       - Text              │
│ #94a3b8  Medium     - Subtitles         │
└─────────────────────────────────────────┘
```

---

## Collapsed Sidebar (80px)

```
┌──────────┬──────────────────────────────────────────────────────┐
│   ICONS  │                    MAIN CONTENT                      │
│          │                                                      │
│ 🏪       │  [Dashboard content visible with more width]       │
│          │                                                      │
│ ────     │                                                      │
│          │                                                      │
│ 📊       │  Stats take full width now                         │
│ 🛒       │  ┌───────────────┐  ┌───────────────┐             │
│ 📦       │  │  📦  150       │  │  🛒 1,245     │             │
│ 🎟️      │  └───────────────┘  └───────────────┘             │
│ 📢       │  ┌───────────────┐  ┌───────────────┐             │
│ 📈       │  │  👥 5,820     │  │  💰 125M      │             │
│          │  └───────────────┘  └───────────────┘             │
│ ────     │                                                      │
│ ▶        │  Actions also visible with wider layout            │
│          │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## Mobile Layout

```
┌─────────────────────────────┐
│                             │
│  Chào mừng trở lại!        │
│  Thứ 5, 19 tháng 1 năm 2025│
│                             │
├─────────────────────────────┤
│ ┌──────────────────────────┐│
│ │     📦 PRODUCTS         ││
│ │         150             ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │      🛒 ORDERS          ││
│ │        1,245            ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │     👥 CUSTOMERS        ││
│ │        5,820            ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │      💰 REVENUE         ││
│ │        125M             ││
│ └──────────────────────────┘│
├─────────────────────────────┤
│  QUICK ACTIONS             │
├─────────────────────────────┤
│ ┌──────────────────────────┐│
│ │  📊 Dashboard / Tổng quan ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │  🛒 Orders / Đơn hàng     ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │  📦 Products / Sản phẩm   ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │  🎟️ Vouchers             ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │  📢 Notifications        ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │  📈 Statistics           ││
│ └──────────────────────────┘│
│                             │
└─────────────────────────────┘
```

---

## Stat Card Detail

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │  🎨 COLORED ICON    │ │
│ │  (48x48 circle)     │ │  ← Color matched to feature
│ │                      │ │
│ │ #3b82f6 (Blue)      │ │
│ └──────────────────────┘ │
│                          │
│ Sản phẩm                 │  ← 14px, gray (#64748b)
│ (Product label)          │
│                          │
│ 150                      │  ← 32px, BOLD, Blue color
│ (Large count)            │
│                          │
└──────────────────────────┘
↓
Background: #eff6ff (Light Blue - 15% opacity of color)
```

---

## Quick Action Card Detail

```
┌─────────────────────────────────────────┐
│ ▌ ┌────┐  📦 Sản phẩm                →  │
│ │ │ ## │                              │
│ │ └────┘                              │
│ └─────────────────────────────────────────┘
  ↓        ↓        ↓
  Left     Icon     Title (flex)
  Border   Circle   Expandable
  4px      48x48    Space
  Blue     Blue     Arrow
  bg       bg       indicator
```

---

## Animation & Interaction

### Sidebar Toggle

```
EXPANDED                    COLLAPSED
(280px)                     (80px)
┌─────────────────┐        ┌──────┐
│ 🏪 Candy Shop   │  →  →  │  🏪  │
│    Admin        │        │      │
│                 │        │      │
│ 📊 Tổng quan   │        │ 📊   │
│                 │        │      │
│ 🛒 Đơn hàng    │        │ 🛒   │
│                 │        │      │
│ ◀ Collapse      │        │ ▶    │
└─────────────────┘        └──────┘
  (click ◀)                  (click ▶)
```

### Loading State

```
┌────────────────────┐
│                    │
│   ◌ Loading...     │  ← Spinner animation
│                    │
│   Đang tải dữ liệu  │
│                    │
└────────────────────┘
```

---

## Responsive Breakpoints

```
Desktop (1200px+)
├─ Sidebar: 280px (expanded)
├─ Stats: 4 columns (23% width)
├─ Actions: 3 columns (32% width)
└─ Padding: 32px

Tablet (768px - 1199px)
├─ Sidebar: 80px (collapsed auto)
├─ Stats: 2 columns (48% width)
├─ Actions: 2 columns
└─ Padding: 24px

Mobile (< 768px)
├─ Sidebar: Hidden
├─ Stats: 2x2 grid (50% width)
├─ Actions: Full width stacked
└─ Padding: 16px
```

---

## Typography Hierarchy

```
LARGEST (28px, Bold)
    ↓
Chào mừng trở lại, Quản trị viên!
    ↓

SECONDARY (18px, Bold)
    ↓
Chức năng chính
    ↓

TERTIARY (14px, Medium)
    ↓
Sản phẩm     /    Tổng quan
    ↓

VALUE (32px, Bold)
    ↓
150          /    1,245
    ↓

SMALL (12px, Regular)
    ↓
Đang tải...     /    Thứ 5, 19 tháng 1
```

---

## Design System

```
SPACING SCALE:
8px   ← Micro
12px  ← Small
16px  ← Medium  ← Used for gaps
24px  ← Large
32px  ← Extra Large ← Used for padding

BORDER RADIUS:
8px   ← Small (icon circles)
12px  ← Medium (cards)
16px  ← Large (stat cards)

SHADOWS:
Subtle: elevation 2 (cards)
None on text elements
Light shadow on hover (future)

COLORS:
Sidebar:  White (#fff)
Content:  Light gray (#f8fafc)
Cards:    White (#fff)
Text:     Dark (#1e293b)
Accents:  6 primary colors
```

---

## Visual Hierarchy

```
IMPORTANCE SCALE:

1️⃣  Sidebar Navigation (persistent, always visible on web)
2️⃣  Welcome + Current Date (personalization)
3️⃣  Stat Cards (key metrics, largest numbers)
4️⃣  Quick Actions (feature access, bright colors)
5️⃣  Loading State (temporary, not prominent)

COLOR INTENSITY:
High:   Action buttons, primary sidebar
Medium: Stat cards, card backgrounds
Low:    Backgrounds, borders, subtitles
```

---

## Final Preview

### Desktop Web Version

```
✅ Professional sidebar with branding
✅ 4-column stats grid
✅ 3-column quick actions
✅ Real-time date display
✅ Color-coded features
✅ Smooth interactions
✅ Responsive layout
✅ No white space waste
```

### Mobile Version

```
✅ Full-screen content
✅ 2x2 stats grid
✅ Responsive actions
✅ Touch-friendly buttons
✅ Auto-scaled images
✅ Optimized spacing
✅ Easy navigation
✅ Clean appearance
```

---

**Overall Look:** Modern, Professional, Vibrant, Responsive ✨
