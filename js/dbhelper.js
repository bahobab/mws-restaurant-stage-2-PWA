/**
 * IndexedDB operations.
*/

// import idb from 'idb';

const DB_NAME = 'restaurantReviews';
const DB_VER = 1;
const RESTAURANT_STORE = 'Restaurants';

//  create IndexedDB
const OpenIDB = createIndexedDB(DB_NAME, DB_VER);

function createIndexedDB(dbName, dbVer) {
  return idb.open(dbName, dbVer, function(upgradeDb) {
    if(!upgradeDb.objectStoreNames.contains(RESTAURANT_STORE)) {
      const restaurantStore = upgradeDb.createObjectStore(RESTAURANT_STORE, {keyPath: 'id'});
    }
  });
}

function saveToIndexedDB(openDB, storeName, data) {
  openDB.then(db => {
    // console.log(`>>>> Storing locally to ${storeName}`);
    const transaction = db.transaction(storeName, 'readwrite');
    store = transaction.objectStore(storeName);
    
    try {
      data.forEach(restaurant => store.put(restaurant));
    } catch (error) {
      // console.log(`### Error saving to IndexedDB: ${error}`);
    }
    return transaction.complete;
  })
}

function readFromIndexedDB(openDB, storeName, typeOfData) {
  // console.log(`>>>> Reading locally from ${storeName}`);
  return openDB.then(db => db.transaction(storeName)
                              .objectStore(storeName)
                              .getAll());
}


/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8081 // Change this to your server port
    // return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:1337/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */

  static async fetchRestaurants(callback) {
    try { // using if (!response.ok) does not work off line with Failed to fetch error
      const response = await fetch(DBHelper.DATABASE_URL);
      const restaurants = await response.json();
      saveToIndexedDB(OpenIDB, RESTAURANT_STORE, restaurants);
      callback(null, restaurants);
    } catch (err) {
      // console.log('>> Offline error:', err);
      const restaurants = await readFromIndexedDB(OpenIDB, RESTAURANT_STORE, 'all');
      // console.log(`Data from local IBD: ${restaurants}`);
      callback(null, restaurants);
      const error = (`Request failed. Returned status of ${err}`);
      callback(error, null);
    }
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    // const images = restaurant.photograph.map(resto => `/img/dest/${resto}`);
    // return (images);
    // console.log(images);
    // handle restaurant.photograph === undefined here
    if (restaurant.photograph){
      return `/img/dest/webp/${restaurant.photograph}-md_1x.webp`;
    }
    return `/img/dest/webp/not-a-restaurant.webp`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
