// set sw version
const CACHE_VER = '4';
const CACHE_RESTAURANT = `RestaurantReviews_${CACHE_VER}`;
const CACHE_DYNAMIC = 'RestaurantDynamic';

// set static cache / app shell
const appAssets = [
    '/',
    'index.html',
    'restaurant.html',
    'css/styles.css',
    'css/my-styles.css',
    'js/dbhelper.js',
    'js/idb.js',
    'js/main.js',
    'js/restaurant_info.js',
    'img/dest/webp',
    'css/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2'
];
    // 'data/restaurants.json', // remove
    
// install sw
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_RESTAURANT)
            .then(cache => cache.addAll(appAssets))
    );
});

// activate sw
self.addEventListener('activate', e => {
    let cleaned = caches.keys()
                    .then( keys => {
                        keys.forEach( key => {
                            if ( key !== CACHE_RESTAURANT && key.match('RestaurantReviews_')) {
                                return caches.delete(key);
                            }
                        });
                    });
    e.waitUntil(cleaned);
});

// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       caches.match(event.request).then(function(response) {
//         return response || fetch(event.request);
//       })
//     );
// });



self.addEventListener('fetch', evt => {
    const getCustomResponsePromise = async () => {

        try {
            // get form cache first
            const cachedResponse = await caches.match(evt.request);
            if (cachedResponse) {
                // respond with the value in the cache
                return cachedResponse;
            }
            // response not in cache, then respond with network
            const netResponse = await fetch(evt.request); // , {headers:{'Cache-control': 'max-age=3600'}}
            // netResponse.headers.set('Cache-control', 'max-age=3600');

            // add fetched response to cache
            const request = evt.request;
            const url = new URL(request.url);
        
            if (evt.request.url.match(location.origin)) {
                let cache = await caches.open(CACHE_RESTAURANT);
                cache.put(evt.request, netResponse.clone());
            } 
            // else {
            //     let cache = await caches.open(CACHE_DYNAMIC);
            //     cache.put(evt.request, netResponse.clone());
            // }

            return netResponse;
        } catch (error) {
            console.log(`ERROR: ${error}`);
            throw error;
            
        }
    }

    evt.respondWith(getCustomResponsePromise());
});