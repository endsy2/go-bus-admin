# Visual Seat Layout Builder Guide

## Overview
The Layouts feature includes three separate sections for configuring bus layouts:
1. **Customer Seats** - Interactive grid for passenger seating
2. **Driver Position** - Separate input for driver location
3. **Aisle Configuration** - Separate input for walkway columns

## How to Use

### Step 1: Basic Configuration
1. Enter **Layout Name** (e.g., "Standard 40-Seater")
2. Enter **Rows** (1-20, e.g., 10)
3. Enter **Columns** (1-10, e.g., 4)

### Step 2: Configure Customer Seats
- Visual grid appears automatically
- **Click any seat** to toggle available/blocked
- Green seats = Available for customers
- Gray seats = Blocked (wheelchair, luggage, etc.)

### Step 3: Configure Driver Position (Optional)
- Enter **Row** number (e.g., 1)
- Enter **Column** number (e.g., 1)
- Driver position shown separately (doesn't affect customer seats)

### Step 4: Configure Aisles (Optional)
- Enter **Aisle Columns** as comma-separated numbers (e.g., "2,3")
- Aisle columns shown separately (doesn't affect customer seats)

### Step 5: Review & Create
- Check the **Layout Summary** showing:
  - Customer seats (available count)
  - Blocked seats count
  - Driver position (if configured)
  - Aisle columns (if configured)
- Click **Create** to save

## Three Separate Sections

### 1. Customer Seats Grid
- **Purpose**: Configure passenger seating only
- **Interactive**: Click to toggle available/blocked
- **Visual**: Green (available) or Gray (blocked)
- **Seat numbers**: A1, A2, B1, B2, etc.
- **Not affected by**: Driver or aisle configuration

### 2. Driver Position
- **Purpose**: Define where the driver sits
- **Inputs**: Row number + Column number
- **Display**: Shows position like "A1" in separate card
- **Independent**: Doesn't modify customer seat grid

### 3. Aisle Columns
- **Purpose**: Define walkway columns
- **Input**: Comma-separated column numbers (e.g., "2,3")
- **Display**: Shows column badges in separate card
- **Independent**: Doesn't modify customer seat grid

## Example Configurations

### Example 1: Simple Bus
```
Layout Name: Standard 30-Seater
Rows: 10
Columns: 3
Driver: Row 1, Column 1
Aisles: (none)

Customer Seats Grid: 10×3 = 30 seats (all available)
Driver Position: A1 (shown separately)
Result: 30 bookable customer seats
```

### Example 2: Bus with Center Aisle
```
Layout Name: Comfort 40-Seater
Rows: 10
Columns: 5
Driver: Row 1, Column 1
Aisles: 3

Customer Seats Grid: 10×5 = 50 positions
Driver Position: A1 (shown separately)
Aisle Columns: Column 3 (shown separately)
Result: 50 bookable customer seats
```

### Example 3: Bus with Blocked Seats
```
Layout Name: Premium 35-Seater
Rows: 10
Columns: 4
Driver: Row 1, Column 1
Aisles: (none)
Blocked: Last 5 seats (for luggage)

Customer Seats Grid: 40 positions, 5 blocked
Driver Position: A1 (shown separately)
Result: 35 bookable customer seats
```

## Visual Layout

The dialog is split into three distinct sections:

### Left Side - Configuration Form
1. **Basic Info**: Name, Rows, Columns, Description
2. **Driver Position Section**: Row + Column inputs
3. **Aisle Configuration Section**: Column numbers input
4. **Layout Summary Card**: Shows counts

### Right Side - Three Preview Cards

#### Card 1: Customer Seats Grid
- Interactive seat grid
- Click to toggle available/blocked
- Shows seat numbers on hover
- Green = Available, Gray = Blocked

#### Card 2: Driver Position (if configured)
- Shows driver seat position (e.g., "A1")
- Dark background card
- Separate from customer seats

#### Card 3: Aisle Columns (if configured)
- Shows aisle column badges
- Dashed border style
- Separate from customer seats

## Key Benefits

### Separation of Concerns
- **Customer seats**: Pure passenger seating configuration
- **Driver**: Tracked separately, doesn't reduce customer seats
- **Aisles**: Tracked separately, doesn't reduce customer seats
- **Total seats**: Only counts available customer seats

### Flexibility
- Configure customer seats independently
- Add/remove driver position without affecting seats
- Add/remove aisles without affecting seats
- Block specific seats for special purposes

## Visual Legend

| Icon | Meaning | Section | Clickable |
|------|---------|---------|-----------|
| 🪑 (Armchair) | Available Seat | Customer Seats | Yes |
| ❌ (X) | Blocked Seat | Customer Seats | Yes |
| 🚗 (Car) | Driver Position | Separate Card | No |
| ⬜ (Dashed) | Aisle Column | Separate Card | No |

## Seat Numbering System
- **Row letters**: A, B, C, D... (up to T for 20 rows)
- **Column numbers**: 1, 2, 3, 4... (up to 10)
- **Format**: Row + Column (e.g., A1, A2, B1, B2)
- **Hover** over any seat to see its number

## Features

### Auto-Calculation
- Total seats = Available seats only
- Excludes: Driver column, Aisles, Blocked seats
- Updates in real-time as you configure

### Interactive Controls
- **Left-click seat**: Toggle available/blocked
- **Driver/Aisle columns**: Cannot be clicked (fixed by input)
- **Hover**: Show seat number or "Driver"

### Validation
- Maximum 20 rows
- Maximum 10 columns
- Driver column must be within column range
- Aisle columns must be valid numbers

### Responsive Design
- Two-column layout on desktop
- Form on left, preview on right
- Scrollable dialog for large layouts
- Mobile-friendly

## Tips

1. **Start simple**: Begin with basic rows/columns, then add driver and aisles
2. **Common patterns**:
   - Driver in column 1 (left side)
   - Center aisle for 4+ columns
   - No aisles for small buses (< 4 columns)
3. **Block seats** for wheelchair spaces, luggage areas, or reserved sections
4. **Preview updates** instantly as you type
5. **Seat count** shows exactly how many bookable seats you have

## Technical Details

### Data Sent to API
```json
{
  "name": "Standard 40-Seater",
  "totalSeats": 40,
  "rows": 10,
  "columns": 4,
  "description": "Standard bus layout with center aisle"
}
```

Note: The visual configuration (driver column, aisles, blocked seats) is used to calculate the correct `totalSeats` value. The API receives the final seat count.
