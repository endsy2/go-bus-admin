# Layouts API Integration Complete ✅

## API Request Structure

### Backend DTO (LayoutRequest)
```java
public class LayoutRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String layout; // JSON string representing seat layout
}
```

### Frontend Payload Structure

The frontend sends:
```json
{
  "name": "Standard 40-Seater",
  "layout": "{\"rows\":10,\"columns\":4,\"totalSeats\":40,\"driverColumn\":1,\"aisleColumns\":\"3\",\"seats\":[[{\"seatNumber\":\"A1\",\"isAvailable\":true},...]]}"
}
```

### Layout JSON Structure (inside the layout string)
```json
{
  "rows": 10,
  "columns": 4,
  "totalSeats": 40,
  "driverColumn": 1,
  "aisleColumns": "3",
  "seats": [
    [
      { "seatNumber": "A1", "isAvailable": true },
      { "seatNumber": "A2", "isAvailable": true },
      { "seatNumber": "A3", "isAvailable": true },
      { "seatNumber": "A4", "isAvailable": true }
    ],
    ...
  ],
  "description": "Standard bus layout"
}
```

## Implementation Details

### layoutService.js
**Create Layout**:
- Accepts layout object from dialog
- Converts to JSON string for `layout` field
- Sends to POST `/api/layouts`

**Update Layout**:
- Accepts layout object from dialog
- Converts to JSON string for `layout` field
- Sends to PUT `/api/layouts/{id}`

**Get Layouts**:
- Fetches from GET `/api/layouts`
- Returns layouts with JSON string

### useLayouts.js Hook
**Parsing Response**:
- Receives layouts from API
- Parses `layout` JSON string back to object
- Merges parsed data with layout object
- Returns enriched layout objects to components

### Dialog Components
**Data Collection**:
- Collects: name, rows, columns, driverColumn, aisleColumns
- Builds seat array from interactive grid
- Calculates totalSeats from available seats
- Passes complete object to layoutService

## Visual Layout Structure

### Driver Row (Top)
- NEW row added at the top
- Shows 🚗 at specified driver column
- Shows aisles at specified aisle columns
- Empty spaces for other columns

### Customer Seats Grid (Below Driver)
- Interactive seat grid (rows × columns)
- Aisle columns shown as dashed borders WITHIN the grid
- Click seats to toggle available/blocked
- Aisles split the seats visually but don't reduce count

## Example Payload

### Input:
- Name: "Comfort Bus"
- Rows: 10
- Columns: 4
- Driver Column: 1
- Aisle Columns: "3"
- 2 seats blocked manually

### Output to API:
```json
{
  "name": "Comfort Bus",
  "layout": "{\"rows\":10,\"columns\":4,\"totalSeats\":38,\"driverColumn\":1,\"aisleColumns\":\"3\",\"seats\":[[{\"seatNumber\":\"A1\",\"isAvailable\":true},{\"seatNumber\":\"A2\",\"isAvailable\":true},{\"seatNumber\":\"A3\",\"isAvailable\":false},{\"seatNumber\":\"A4\",\"isAvailable\":true}],...],\"description\":null}"
}
```

### Visual Result:
```
🚗 🪑 ⬜ 🪑  (Driver row)
🪑 🪑 ⬜ 🪑  (Row A - customer seats)
🪑 🪑 ⬜ 🪑  (Row B - customer seats)
...
```

## Data Flow

### Create/Update Flow:
1. User configures layout in dialog
2. Dialog builds complete layout object
3. layoutService converts object to JSON string
4. API receives: `{ name, layout: "JSON_STRING" }`
5. Backend stores layout

### Fetch Flow:
1. API returns: `{ id, name, layout: "JSON_STRING" }`
2. useLayouts hook parses JSON string
3. Merges parsed data with layout object
4. Components receive enriched layout objects

## Build Status
✅ Build successful
- JS bundle: 189.4 kB
- CSS bundle: 11.95 kB
- No compilation errors
- API structure matches backend DTO

## Key Features Preserved
- Interactive seat grid
- Driver row at top
- Aisles within customer seats
- Click to toggle seats
- Auto-calculate total seats
- JSON serialization for API
- JSON parsing on fetch
