import CryptoJS from "crypto-js";

interface User {
  id: number;
  name: string;
  // otros campos que necesites
}

const useDB = () => {
  const dbName = "username";
  const storeName = "users";
  const secretKey = "your-secret-key"; // Define una clave secreta para la encriptación

  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);

      request.onerror = (event: Event): void => {
        console.error("Error opening IndexedDB:", event);
        reject(event);
      };

      request.onsuccess = (event: Event): void => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        console.log("Database opened successfully:", db);
        resolve(db);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
          console.log("Object store 'users' created.");
        }
      };
    });
  };

  const encryptData = (data: Omit<User, "id">): string => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  };

  const decryptData = (data: string): Omit<User, "id"> => {
    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  };

  const addUser = async (user: Omit<User, "id">): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    const userId = Date.now(); // Generar ID único basado en el timestamp
    const encryptedData = encryptData(user);
    const request = store.add({ id: userId, encryptedData });

    request.onsuccess = () => {
      console.log("User added:", { id: userId, ...user });
    };

    request.onerror = (event: Event) => {
      console.error("Error adding user:", event);
    };
  };

  const getUser = async (id: number): Promise<User | undefined> => {
    const db = await initDB();
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result) {
          const decryptedData = decryptData(request.result.encryptedData);
          resolve({ id, ...decryptedData });
        } else {
          resolve(undefined);
        }
      };

      request.onerror = (event: Event) => {
        console.error("Error getting user:", event);
        reject(event);
      };
    });
  };

  const updateUser = async (user: User): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const encryptedData = encryptData(user);
    const request = store.put({ id: user.id, encryptedData });

    request.onsuccess = () => {
      console.log("User updated:", user);
    };

    request.onerror = (event: Event) => {
      console.error("Error updating user:", event);
    };
  };

  const deleteUser = async (id: number): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log("User deleted:", id);
    };

    request.onerror = (event: Event) => {
      console.error("Error deleting user:", event);
    };
  };

  return {
    initDB,
    addUser,
    getUser,
    updateUser,
    deleteUser,
  };
};

export default useDB;
