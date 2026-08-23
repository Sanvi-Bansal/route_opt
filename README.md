# RouteOpt — Vehicle Route & Fuel Cost Optimizer

## 1. Project Overview

**RouteOpt** is a web-based Vehicle Route & Fuel Cost Optimizer that helps users find an efficient visiting order for multiple delivery or pickup stops.

The user enters the name, latitude, and longitude of each stop. RouteOpt calculates the distance between the stops using the **Haversine formula** and uses the **Nearest-Neighbor heuristic** to generate an efficient route.

The application also estimates fuel consumption and fuel cost based on the vehicle mileage and fuel price entered by the user.

RouteOpt performs the main route calculation using JavaScript and does not depend on a map or routing API for its core optimization algorithm.

---

## 2. Problem Statement

Planning a route for multiple delivery or pickup stops can become difficult as the number of stops increases. There can be many possible orders in which the stops can be visited, making it difficult to manually find an efficient route.

RouteOpt provides a simple solution by automatically calculating distances between stops and generating an efficient visiting order.

The project uses a **Nearest-Neighbor heuristic**, which repeatedly selects the closest unvisited stop from the current location.

The system also calculates the estimated fuel required and fuel cost for the generated route.

---

## 3. Objectives

The main objectives of RouteOpt are:

1. To calculate distances between multiple geographical coordinates.
2. To generate an efficient visiting order for multiple delivery or pickup stops.
3. To implement a genuine route optimization algorithm using JavaScript.
4. To use the Haversine formula for geographical distance calculation.
5. To implement the Nearest-Neighbor heuristic for route optimization.
6. To calculate estimated fuel consumption.
7. To calculate estimated fuel cost.
8. To allow users to save and reuse groups of stops.
9. To maintain route history using LocalStorage.
10. To provide a simple and user-friendly route planning interface.

---

## 4. Features

### User Authentication

* User sign-up and login.
* User logout.
* User session management using LocalStorage.
* Separate stop and route data for different users.

### Stop Management

* Add delivery or pickup stops.
* Enter stop name, latitude, and longitude.
* Validate latitude and longitude values.
* Remove individual stops.
* Clear all stops.
* Display the current list of stops.

### Route Optimization

* Calculate the distance between every pair of stops.
* Build a distance matrix using the Haversine formula.
* Generate an initial route using the Nearest-Neighbor heuristic.
* Start the route from the first entered stop.
* Visit the nearest unvisited stop at each step.
* Return to the starting stop after visiting all stops.
* Display the ordered route and distance of each route leg.

### Fuel Cost Estimation

The user can enter:

* Vehicle mileage in km/L.
* Fuel price in ₹/L.

RouteOpt calculates:

**Fuel Used**

```text
Fuel Used = Total Distance / Vehicle Mileage
```

**Fuel Cost**

```text
Fuel Cost = Fuel Used × Fuel Price
```

### Saved Stop Sets

* Save a group of stops with a custom name.
* Load previously saved stop sets.
* Delete saved stop sets.
* Store saved sets in LocalStorage.

### Route History

After a route is optimized, RouteOpt stores:

* Date and time.
* Number of stops.
* Total distance.
* Fuel used.
* Fuel cost.
* Ordered route names.

The Dashboard displays route history along with total distance, total fuel spending, and the number of optimization runs.

---

## 5. Technology Used

### Frontend

* **HTML5** — Used to create the structure of the webpages.
* **CSS3** — Used for styling and responsive design.
* **Vanilla JavaScript** — Used for application logic, DOM manipulation, calculations, and route optimization.

### JavaScript Concepts Used

The project uses:

* Variables using `let` and `const`
* Conditional statements
* `for` and `while` loops
* Functions
* Arrow functions
* Arrays
* Objects
* JSON
* Array methods such as:

  * `push()`
  * `map()`
  * `filter()`
  * `reduce()`
  * `sort()`
* Template literals
* Destructuring
* DOM manipulation
* Event handling
* Form validation
* LocalStorage

### Algorithms

* Haversine distance calculation
* Distance matrix construction
* Nearest-Neighbor heuristic

### Data Storage

RouteOpt uses **Browser LocalStorage** to store:

* User accounts
* Login sessions
* Current stops
* Saved stop sets
* Route history

JSON is used to convert JavaScript objects and arrays into strings for storage and back into JavaScript data when loading.

---

## 6. How It Works

RouteOpt follows the following workflow:

### Step 1 — Create an Account or Log In

The user can create an account using their name, email, and password or log in using an existing account.

The authentication information and session are stored locally in the browser.

### Step 2 — Add Stops

The user enters:

* Stop name
* Latitude
* Longitude

Each stop is represented as an object containing its name and coordinates.

Example:

```text
{
    name: "Warehouse",
    lat: 28.6139,
    lng: 77.2090
}
```

### Step 3 — Build the Distance Matrix

RouteOpt calculates the distance between every pair of stops using the Haversine formula.

These distances are stored in a two-dimensional distance matrix.

For example:

```text
matrix[i][j]
```

represents the distance between stop `i` and stop `j`.

### Step 4 — Apply Nearest-Neighbor

The algorithm starts from the first stop.

It then:

1. Looks at all unvisited stops.
2. Finds the closest stop.
3. Moves to that stop.
4. Marks it as visited.
5. Repeats the process until all stops have been visited.

### Step 5 — Return to the Starting Stop

After visiting all stops, the route returns to the first stop.

This creates a complete round-trip route.

### Step 6 — Calculate Fuel Usage

The total route distance is divided by the vehicle mileage to estimate the fuel required.

### Step 7 — Calculate Fuel Cost

The estimated fuel usage is multiplied by the fuel price entered by the user.

### Step 8 — Display and Save Results

The application displays:

* Ordered stops.
* Distance of each route leg.
* Total route distance.
* Estimated fuel cost.
* Number of stops.

The result is then saved to route history in LocalStorage.

---

## 7. Route Optimization Algorithm

RouteOpt uses the **Nearest-Neighbor heuristic** to generate an efficient route.

Nearest-Neighbor is a simple heuristic for the Traveling Salesman Problem.

### Working of the Algorithm

1. Start from the first stop.
2. Mark the starting stop as visited.
3. Check all unvisited stops.
4. Find the closest unvisited stop.
5. Add that stop to the route.
6. Mark it as visited.
7. Repeat until every stop has been visited.
8. Return to the starting stop.

### Simplified Algorithm

```text
Start at the first stop

Mark the first stop as visited

While there are unvisited stops:

    Find the closest unvisited stop

    Move to that stop

    Mark it as visited

Return to the starting stop
```

### Example

Suppose the stops are:

```text
A → B → C → D
```

If the closest stop from `A` is `C`, the algorithm chooses:

```text
A → C
```

It then finds the closest unvisited stop from `C`.

For example:

```text
A → C → B → D → A
```

The exact route depends on the coordinates entered by the user.

### Why Nearest-Neighbor?

Nearest-Neighbor is useful because it is simple and fast compared with checking every possible route.

However, it is a **heuristic**, so it does not guarantee the mathematically shortest possible route for every set of stops.

---

## 8. Haversine Distance Formula

RouteOpt uses the **Haversine formula** to calculate the approximate geographical distance between two latitude and longitude points.

The Earth radius used in the implementation is:

```text
R = 6371 km
```

The latitude and longitude differences are converted from degrees to radians before applying the formula.

The formula calculates the great-circle distance between two points on the Earth's surface.

The calculated distance is returned in kilometres.

RouteOpt uses this calculation to build the distance matrix:

```text
matrix[i][j] = distance from stop i to stop j
```

This matrix is then used by the Nearest-Neighbor algorithm to decide which stop should be visited next.

---

## 9. LocalStorage

RouteOpt uses the browser's **LocalStorage** for data persistence.

This allows the application to store data without requiring a separate database.

### User Data

The application stores user account information locally.

### Login Session

The current logged-in user's session is stored in LocalStorage so that the application can identify the active user.

### Current Stops

The stops currently being worked on are saved so they can be loaded again.

### Saved Stop Sets

Users can save a group of stops with a custom name and load it later.

### Route History

Each optimization result can be stored with:

* Date
* Number of stops
* Total distance
* Fuel used
* Fuel cost
* Stop names

The Dashboard uses this history to calculate and display:

* Total fuel money spent.
* Total optimized distance.
* Total number of optimization runs.

The application uses `JSON.stringify()` when storing arrays or objects and `JSON.parse()` when retrieving them.

---

## 10. Project Structure

```text
RouteOpt/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── auth.js
│   ├── dashboard.js
│   ├── optimizer-page.js
│   ├── optimizer.js
│   ├── storage.js
│   └── utils.js
│
├── pages/
│   ├── about.html
│   ├── dashboard.html
│   └── optimizer.html
│
└── README.md
```

### File Description

#### `index.html`

The main landing page of RouteOpt.

It contains the project introduction, features, navigation, and authentication interface.

#### `optimizer.html`

The main route optimization page.

It contains the interface for:

* Adding stops.
* Entering vehicle mileage.
* Entering fuel price.
* Saving stop sets.
* Running route optimization.
* Viewing the optimized route.

#### `optimizer.js`

Contains the main route optimization logic:

* Haversine formula.
* Distance matrix generation.
* Nearest-Neighbor algorithm.
* Route distance calculation.

#### `optimizer-page.js`

Connects the optimization logic with the webpage.

It handles:

* Adding stops.
* Removing stops.
* Displaying stops.
* Running optimization.
* Calculating fuel usage.
* Calculating fuel cost.
* Displaying the ordered route.
* Saving route history.
* Saving and loading stop sets.

#### `storage.js`

Contains LocalStorage functions for:

* Current stops.
* Saved stop sets.
* Route history.
* Total fuel spending.
* Total optimized distance.

#### `auth.js`

Handles:

* User signup.
* User login.
* User logout.
* User session management.
* Authentication interface.

#### `dashboard.js`

Displays:

* Total fuel money spent.
* Total optimized distance.
* Number of optimization runs.
* Previous route history.

#### `utils.js`

Contains reusable utility functions such as:

* Toast notifications.
* HTML escaping.
* Attribute escaping.
* Number formatting.

#### `style.css`

Contains the styling for the RouteOpt interface, including navigation, forms, cards, dashboard elements, optimizer elements, route results, and responsive layouts.

---

## 11. How to Run

RouteOpt is a client-side web application and does not require Node.js, npm, a database, or an API key.

### Using VS Code Live Server

1. Clone or download the repository.
2. Open the project folder in VS Code.
3. Install the **Live Server** extension if it is not already installed.
4. Open `index.html`.
5. Right-click on `index.html`.
6. Select **Open with Live Server**.
7. The RouteOpt homepage will open in the browser.

### Using Python Local Server

If Python is installed, open a terminal inside the project folder and run:

```bash
python -m http.server
```

Then open the local server address displayed in the terminal.

No additional package installation is required.

---

## 12. Example Workflow

A typical RouteOpt workflow is:

```text
1. Open RouteOpt
        ↓
2. Create an account / Log in
        ↓
3. Open the Optimizer
        ↓
4. Add delivery or pickup stops
        ↓
5. Enter vehicle mileage
        ↓
6. Enter fuel price
        ↓
7. Click "Optimize Route"
        ↓
8. Haversine distances are calculated
        ↓
9. Distance matrix is created
        ↓
10. Nearest-Neighbor generates the route
        ↓
11. Total distance is calculated
        ↓
12. Fuel usage is calculated
        ↓
13. Fuel cost is calculated
        ↓
14. Ordered route is displayed
        ↓
15. Result is saved to route history
        ↓
16. History can be viewed on Dashboard
```

### Example Input

```text
Stop 1:
Name: Warehouse
Latitude: 28.6139
Longitude: 77.2090

Stop 2:
Name: Customer A
Latitude: 28.5355
Longitude: 77.3910

Stop 3:
Name: Customer B
Latitude: 28.4595
Longitude: 77.0266

Mileage:
15 km/L

Fuel Price:
100 ₹/L
```

After clicking **Optimize Route**, RouteOpt calculates the distances and generates an efficient visiting order using the Nearest-Neighbor heuristic.

The application then displays:

* Ordered stops.
* Distance between consecutive stops.
* Total route distance.
* Estimated fuel cost.
* Number of stops.

---

## 13. Limitations

### 1. Straight-Line Distance

The Haversine formula calculates geographical distance between coordinates.

It does not calculate actual road distance.

### 2. Traffic Is Not Considered

The application does not consider:

* Traffic conditions.
* Road closures.
* Accidents.
* Speed limits.
* One-way roads.
* Road restrictions.

### 3. No Real-Time Map Routing

RouteOpt does not use a commercial map-routing API.

Therefore, the route is optimized using the geographical distances between the entered coordinates rather than actual road networks.

### 4. Heuristic Solution

Nearest-Neighbor is a heuristic algorithm.

It generates an efficient route but does not guarantee the mathematically shortest possible route for every set of stops.

### 5. LocalStorage Storage

Data is stored in the user's browser.

Clearing browser LocalStorage can remove saved accounts, sessions, stops, saved stop sets, and route history.

### 6. Local Authentication

The authentication system is implemented using LocalStorage for this educational project.

It is not intended to provide production-level authentication or security.

### 7. Fuel Cost Is an Estimate

Fuel cost depends on the mileage and fuel price entered by the user.

Actual fuel consumption can vary depending on traffic, vehicle load, driving conditions, and other factors.

---

## 14. Future Improvements

Possible future improvements include:

* Integration with a real road-routing API.
* Real-time traffic information.
* Address-to-coordinate geocoding.
* Interactive map visualization.
* Multiple vehicle support.
* Vehicle capacity constraints.
* Delivery time-window constraints.
* More advanced Vehicle Routing Problem algorithms.
* Improved fuel-consumption models.
* Secure backend authentication.
* Database integration.
* Cloud-based data storage.
* Route visualization on an interactive map.
* Exporting optimized routes as PDF or CSV.
* Mobile application support.

---

## 15. Team Members

The project was developed collaboratively by all team members. All members contributed to the planning, development, testing, debugging, documentation, and GitHub management of the project.

### Sanvi

* Contributed to project planning and development.
* Worked on frontend and JavaScript implementation.
* Contributed to route optimization and LocalStorage functionality.
* Participated in testing and debugging.
* Contributed to documentation and GitHub management.

### Ananya

* Contributed to project planning and development.
* Worked on frontend and JavaScript implementation.
* Contributed to route optimization and LocalStorage functionality.
* Participated in testing and debugging.
* Contributed to documentation and GitHub management.

### Mehnoor

* Contributed to project planning and development.
* Worked on frontend and JavaScript implementation.
* Contributed to route optimization and LocalStorage functionality.
* Participated in testing and debugging.
* Contributed to documentation and GitHub management.

All team members worked collaboratively using Git and GitHub branches. Contributions can be tracked through commits and repository history.

---

## Conclusion

RouteOpt demonstrates how a practical vehicle routing problem can be solved using mathematical calculations and algorithmic techniques without depending on a commercial map-routing API.

The project uses the **Haversine formula** to calculate distances and the **Nearest-Neighbor heuristic** to generate an efficient visiting order for multiple stops.

Along with route optimization, RouteOpt provides fuel cost estimation, user authentication, saved stop sets, route history, and a dashboard.

The project demonstrates the practical use of JavaScript concepts such as arrays, objects, functions, loops, DOM manipulation, events, JSON, and LocalStorage while solving a real-world route planning problem.
