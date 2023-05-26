import { Injectable } from '@angular/core';
import { ReplaySubject, Observable, of, Subscriber } from 'rxjs';
import { take, filter, tap, delay } from 'rxjs/operators';

export enum DB_NAME {
    LOGS = 'logs',
    REPORT = 'report',
    TEST = 'test'
}

const VERSION = 1.2;

@Injectable({
  providedIn: 'root'
})
export class DbService  {
  private canUse = false;
  target = new ReplaySubject<IDBDatabase | null>(1);

  $db = this.target.pipe(take(1), filter(db => !!db));
  
  constructor() {
  }

  initialize(): Observable<boolean> {
    return new Observable(sub=>{
      this.init('ws-watcher', sub)
    })
   
  }

  private init(dbName: string, sub: Subscriber<boolean>) {
    const onError = (error: any) => {
      console.error(error);
      this.target.complete();
    };

    if (!window.indexedDB) {
      onError(new Error('相容性错误'));
      return;
    }
    try {
      const request = window.indexedDB.open(dbName, VERSION);

      request.onerror = (error) => {
        onError(error);
      };

      request.onsuccess = () => {
        console.log('inin')
        this.canUse = true;
        this.target.next(request.result);
        sub.next(true);
        sub.complete();
      };

      request.onupgradeneeded = () => {
        const db: IDBDatabase = request.result;

        let objectStore: IDBObjectStore;
        if (!db.objectStoreNames.contains(DB_NAME.LOGS)) {
            objectStore = db.createObjectStore('logs', { keyPath: 'timestamp' });

            objectStore.createIndex('id', ['event','timestamp'], { unique: false });
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            objectStore.createIndex('level', 'level', { unique: false });
            objectStore.createIndex('event', 'event', { unique: false });
            objectStore.createIndex('msg', 'msg', { unique: false });
        }

        if (!db.objectStoreNames.contains(DB_NAME.REPORT)) {
            objectStore = db.createObjectStore('report', { keyPath: 'timestamp' });

            objectStore.createIndex('id', ['category','timestamp'], { unique: false });
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            objectStore.createIndex('category', 'category', { unique: false });
            objectStore.createIndex('title', 'title', { unique: false });
            objectStore.createIndex('value', 'value', { unique: false });
        }

        if (!db.objectStoreNames.contains(DB_NAME.TEST)) {
          objectStore = db.createObjectStore('test', { keyPath: 'timestamp' });

          objectStore.createIndex('id', ['event','timestamp'], { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('type', 'type', { unique: false });
          objectStore.createIndex('isRead', 'isRead', { unique: false });
          objectStore.createIndex('msg', 'msg', { unique: false });
          objectStore.createIndex('history', 'history', { unique: false });
      }
      };
    } catch (error) {
      this.canUse = false;
    }

  }
  getByIndex(storeName: DB_NAME, index: string, value: string[]) {
    console.log('getByIndex')
    const res: any = [];
    return new Observable(subscriber => {
        console.log('Observable', this.canUse)

      if (this.canUse === false) {
        subscriber.next([]);
        subscriber.complete();
        return;
      }
      console.log('subscribe')
      this.$db.subscribe((db) => {
        if(!db){
            return
        }
        console.log('getByIndex')
        const transaction = db.transaction([storeName], 'readonly');

        const objectStore = transaction.objectStore(storeName);

        const request =  objectStore.index(index);

        request.openCursor().onsuccess = (event: any) => {
           
            const cursor: any = event.target.result;
            if (cursor ) {
                if(value.includes(cursor.value[index]) ){
                    res.push(cursor.value)
                }
              cursor.continue();
            } else {
              subscriber.next(res);
              subscriber.complete();
            }
          };
        });

    
    });
  }
  get(storeName: DB_NAME, key?: any, count = 99999) {
    return new Observable(subscriber => {
      const onError = (error: any) => {
        console.error(error);
        subscriber.complete();
      };

      if (this.canUse === false) {
        subscriber.next([]);
        subscriber.complete();
        return;
      }

      this.$db.subscribe((db) => {
        if(!db){
            return
        }
        const transaction = db.transaction([storeName], 'readonly');

        const objectStore = transaction.objectStore(storeName);
        
        const request = key ? objectStore.get(key) : objectStore.getAll(undefined, count) ;

        request.onerror = (error) => {
          onError(error);
        };

        request.onsuccess = () => {
          const record = request.result;

          if (record) {
            subscriber.next(record);
          } else {
            subscriber.next(null);
          }

          subscriber.complete();
        };
      });
    });
  }

  put(storeName: DB_NAME, value: any) {
    return new Observable(subscriber => {
      const onError = (error: any)  => {
        console.error(error);
        subscriber.complete();
      };
      if (this.canUse === false) {
        subscriber.next([]);
        subscriber.complete();
        return;
      }
      this.$db.subscribe((db) => {
        if(!db){
            return
        }
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(value);

        request.onerror = (error) => {
          onError(error);
        };

        request.onsuccess = () => {
          subscriber.next(request.result);
          subscriber.complete();
        };
      });
    });
  }

//   searchFriends(value: string) {
//     const friends = [];
//     return new Observable(subscriber => {
//       if (this.canUse === false) {
//         subscriber.next([]);
//         subscriber.complete();
//         return;
//       }
//       this.$db.subscribe((db) => {
//         const transaction = db.transaction(['friends'], 'readonly');
//         const index = transaction.objectStore('friends').index('name');

//         const cursor = index.openCursor();
//         cursor.onsuccess = (e: any) => {
//           const result = e.target.result;
//           if (result) {
//             if (result.value.name.indexOf(value) !== -1) {
//               friends.push(result.value);
//             }
//             result.continue();
//           } else {
//             subscriber.next(friends);
//             subscriber.complete();
//           }
//         };
//       });
//     });
//   }

}