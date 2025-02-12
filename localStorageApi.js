class localStorageApi {
  constructor(DatabaseReference = "", DefaultDataOptions = {}, path = []) {
    if (typeof DatabaseReference !== "string") {
      throw new Error("DatabaseReference must be a string.");
    }

    this.dbRef = DatabaseReference;
    this._path = path;  // Added: path to track nested keys
    this._liveListeners = [];
    this._lastState = null;

    this.DefaultDataOptions = {
      identifierWord: DefaultDataOptions.identifierWord || "_id",
      identifierMethod: DefaultDataOptions.identifierMethod || "crypto uuid",
    };

    if (typeof window !== "undefined" && !localStorage.getItem(this.dbRef)) {
      localStorage.setItem(this.dbRef, JSON.stringify({}));
    }
  }

  /************ Private Functions ************/

  _isBrowser() {
    return typeof window !== "undefined";
  }

  _generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  /************ Modified Private Function ************/

  _loadDatabase() {
    if (!this._isBrowser()) return {};
    try {
      const fullData = JSON.parse(localStorage.getItem(this.dbRef)) || {};
      return this._path.reduce((acc, key) => (acc && acc[key] ? acc[key] : {}), fullData);
    } catch (error) {
      console.error("Error loading database:", error);
      return {};
    }
  }

  _saveDatabase(data) {
    if (!this._isBrowser()) return;
    try {
      const fullData = JSON.parse(localStorage.getItem(this.dbRef)) || {};
      let target = fullData;

      for (let i = 0; i < this._path.length - 1; i++) {
        target = target[this._path[i]] = target[this._path[i]] || {};
      }
      target[this._path[this._path.length - 1]] = data;

      localStorage.setItem(this.dbRef, JSON.stringify(fullData));
      this._triggerLiveListeners(fullData);
    } catch (error) {
      console.error("Error saving database:", error);
    }
  }

  /************ Modified Private Function ************/

  // _loadDatabase() {
  //   if (!this._isBrowser()) return {};
  //   try {
  //     return JSON.parse(localStorage.getItem(this.dbRef)) || {};
  //   } catch (error) {
  //     console.error("Error loading database:", error);
  //     return {};
  //   }
  // }

  // _saveDatabase(data) {
  //   if (!this._isBrowser()) return;
  //   try {
  //     localStorage.setItem(this.dbRef, JSON.stringify(data));
  //     this._triggerLiveListeners(data);
  //   } catch (error) {
  //     console.error("Error saving database:", error);
  //   }
  // }

  // _addLiveListener(callback) {
  //   if (typeof callback !== "function") throw new Error("Callback must be a function.");
  //   this._liveListeners.push(callback);
  // }

  _addLiveListener(callback) {
    if (typeof callback !== "function") throw new Error("Callback must be a function.");
    this._liveListeners.push(callback);
    // Return an unsubscribe function
    return () => {
      this._liveListeners = this._liveListeners.filter(listener => listener !== callback);
    };
  }

  _triggerLiveListeners(currentState) {
    this._liveListeners.forEach(callback => callback(currentState));
  }

  _onChange(callback, interval) {
    if (typeof callback !== "function") throw new Error("Callback must be a function.");
    setInterval(() => {
      const currentState = this._loadDatabase();
      if (JSON.stringify(currentState) !== JSON.stringify(this._lastState)) {
        this._lastState = currentState;
        callback(currentState);
      }
    }, interval);
  }

  _insertOne(data) {
    if (typeof data !== "object" || data === null) {
      throw new Error("Data must be an object.");
    }

    const db = this._loadDatabase();
    const { Word, Method } = this.getIdentifier(this.DefaultDataOptions.identifierWord, this.DefaultDataOptions.identifierMethod);
    const id = data[Word] || Method;

    const newItem = {
      [Word]: id,
      "_createdAt": new Date().toISOString(),
      "_updatedAt": new Date().toISOString(),
      ...data,
    };

    db[id] = newItem;
    this._saveDatabase(db);
    return newItem;
  }

  _updateOne(id, updates) {
    if (typeof id !== "string" || typeof updates !== "object" || updates === null) {
      throw new Error("Invalid arguments.");
    }

    const db = this._loadDatabase();
    if (!db[id]) {
      throw new Error("Item not found.");
    }

    db[id] = {
      ...db[id],
      ...updates,
      "_updatedAt": new Date().toISOString(),
    };

    this._saveDatabase(db);
    return db[id];
  }

  _removeOne(id) {
    if (typeof id !== "string") {
      throw new Error("ID must be a string.");
    }

    const db = this._loadDatabase();
    if (db[id]) {
      delete db[id];
      this._saveDatabase(db);
      return true;
    }

    return false;
  }

  getIdentifier(word = "_id", method = "crypto uuid") {
    const dbUuid = this._generateUUID();
    const Word = ["_key", "_id"].includes(word) ? word : "_id";
    const Method = method === "crypto uuid" ? dbUuid : dbUuid;
    return { Word, Method };
  }

  /************ Public Functions ************/

  load() {
    return this._loadDatabase();
  }

  insert(data) {
    return this._insertOne(data);
  }

  insertMany(items) {
    if (!Array.isArray(items)) {
      throw new Error("Data must be an array.");
    }
    const insertedItems = [];
    for (const item of items) {
      const insertedItem = this._insertOne(item);
      insertedItems.push(insertedItem);
    }
    return insertedItems;
  }

  find(id) {
    if (typeof id !== "string") throw new Error("ID must be a string.");
    const db = this._loadDatabase();
    return db[id] || null;
  }

  findOne(id) {
    return this.find(id);
  }

  update(id, updates) {
    return this._updateOne(id, updates);
  }

  remove(id) {
    return this._removeOne(id);
  }

  updateMany(updatesArray) {
    if (!Array.isArray(updatesArray)) {
      throw new Error("Updates must be an array of objects containing 'id' and 'updates'.");
    }

    return updatesArray.map(({ id, updates }) => this._updateOne(id, updates));
  }

  removeMany(ids) {
    if (!Array.isArray(ids)) {
      throw new Error("IDs must be an array.");
    }

    const results = ids.map(id => this._removeOne(id));
    return results;
  }

  // --- Event-Driven Methods (Immediate Trigger) ---

  live(callback) {
    this._addLiveListener(callback);
  }

  // --- Polling-Based Methods (Interval Check) ---

  onLive(callback, interval = 1000) {
    this._onChange(callback, interval);
  }

  /************ Added Methods ************/

  child(path) {
    if (typeof path !== "string") {
      throw new Error("Path must be a string.");
    }
    return new localStorageApi(this.dbRef, this.DefaultDataOptions, [...this._path, path]);
  }

  select(path) {
    return this.child(path);  // Alias for `child()`
  }

}

// Add aliases for alternative function names
const aliasMap = {
  insert: ["upload", "add", "set", "uploadOne", "addOne", "setOne", "inject", "injectOne"],
  insertMany: ["insertMulti", "uploadMany", "uploadMulti", "addMany", "addMulti", "setMany", "setMulti", "injectMany", "injectMulti"],
  load: ["read", "retrieve", "get"],
  find: ["findMany", "findMulti", "query", "queryMany", "queryMulti"],
  findOne: ["queryOne"],
  update: ["updateOne", "put", "putOne"],
  updateMany: ["updateMulti", "putMany", "putMulti"],
  remove: ["removeOne", "delete", "deleteOne"],
  removeMany: ["removeMulti", "deleteMany", "deleteMulti"],
  live: ["subscribe", "listen", "watch"],
  onLive: ["onSubscribe", "onListen", "onWatch"],
};

Object.keys(aliasMap).forEach(original => {
  aliasMap[original].forEach(alias => {
    localStorageApi.prototype[alias] = localStorageApi.prototype[original];
  });
});

export default localStorageApi;