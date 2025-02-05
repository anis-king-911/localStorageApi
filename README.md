
# `localStorageApi` Documentation

## Overview
`localStorageApi` is a JavaScript utility class designed to manage and manipulate the browser's `localStorage` with advanced features like real-time data listening, data insertion, updates, and removal. This class supports single and batch operations with customizable options for identifiers and live updates.

---

## Table of Contents
- [Class Constructor](#class-constructor)
- [Public Methods](#public-methods)
  - [Data Loading and Retrieval](#data-loading-and-retrieval)
  - [Data Insertion](#data-insertion)
  - [Data Update](#data-update)
  - [Data Removal](#data-removal)
  - [Event-Driven Methods](#event-driven-methods)
- [Usage Examples](#usage-examples)
- [Alias Methods](#alias-methods)

---

## Class Constructor

### `new localStorageApi(DatabaseReference, DefaultDataOptions)`
- **Parameters:**
  - `DatabaseReference` (`string`): The key for accessing the database in `localStorage`.
  - `DefaultDataOptions` (`object`): Options for default identifier.
    - `identifierWord` (`string`, default: `_id`)
    - `identifierMethod` (`string`, default: `"crypto uuid"`)

- **Example:**
  ```javascript
  const db = new localStorageApi("myDatabase", { identifierWord: "_key", identifierMethod: "crypto uuid" });
  ```

---

## Public Methods

### Data Loading and Retrieval

#### `load()`
- Loads the entire database from `localStorage`.
- **Returns:** `object` – The current state of the database.

#### `find(id)`
- Retrieves an item by its identifier.
- **Parameters:** `id` (`string`)
- **Returns:** `object` – The found item or `null`.

#### `findOne(id)`
- Alias for `find`.

---

### Data Insertion

#### `insert(data)`
- Inserts a single item into the database.
- **Parameters:** `data` (`object`)
- **Returns:** `object` – The inserted item.

#### `insertMany(items)`
- Inserts multiple items into the database.
- **Parameters:** `items` (`array`)
- **Returns:** `array` – An array of inserted items.

---

### Data Update

#### `update(id, updates)`
- Updates an item by its identifier.
- **Parameters:**
  - `id` (`string`)
  - `updates` (`object`)
- **Returns:** `object` – The updated item.

#### `updateMany(updatesArray)`
- Updates multiple items.
- **Parameters:** `updatesArray` (`array` of objects with `id` and `updates`)
- **Returns:** `array` – An array of updated items.

---

### Data Removal

#### `remove(id)`
- Removes an item by its identifier.
- **Parameters:** `id` (`string`)
- **Returns:** `boolean` – `true` if the item was removed, `false` otherwise.

#### `removeMany(ids)`
- Removes multiple items.
- **Parameters:** `ids` (`array` of strings)
- **Returns:** `array` – An array of results (`true` or `false` for each item).

---

### Event-Driven Methods

#### `live(callback)`
- Registers a callback for real-time updates when data changes.
- **Parameters:** `callback` (`function`)

#### `onLive(callback, interval)`
- Registers a polling-based callback to check for data changes at intervals.
- **Parameters:**
  - `callback` (`function`)
  - `interval` (`number`, default: `1000` ms)

---

## Usage Examples

### 1. Initialize the Database
```javascript
const db = new localStorageApi("myAppDatabase");
```

### 2. Insert Single Item
```javascript
const newItem = db.insert({ name: "John Doe", age: 30 });
console.log(newItem);
```

### 3. Insert Multiple Items
```javascript
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 28 }
];
const insertedUsers = db.insertMany(users);
console.log(insertedUsers);
```

### 4. Find an Item
```javascript
const user = db.find("some-unique-id");
console.log(user);
```

### 5. Update an Item
```javascript
const updatedUser = db.update("some-unique-id", { age: 31 });
console.log(updatedUser);
```

### 6. Remove an Item
```javascript
const wasRemoved = db.remove("some-unique-id");
console.log(wasRemoved);  // true or false
```

### 7. Real-Time Data Listening
```javascript
db.live(currentState => {
  console.log("Database changed:", currentState);
});
```

---

## Alias Methods

For convenience, `localStorageApi` provides multiple aliases for its methods. Here are some examples:

- **`insert`**: `upload`, `add`, `set`, `injectOne`
- **`find`**: `query`, `findMany`, `queryMany`
- **`update`**: `put`, `updateOne`
- **`remove`**: `delete`, `removeOne`
- **`live`**: `subscribe`, `listen`, `watch`

---

