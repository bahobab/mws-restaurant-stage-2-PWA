// set sw version
const CACHE_VER = '3';
const CACHE_NAME = `RestaurantReviews_${CACHE_VER}`;

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
    'img/dest/webp'
];
    // 'data/restaurants.json', // remove
    
// install sw
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(appAssets))
    );
});

// activate sw
self.addEventListener('activate', e => {
    let cleaned = caches.keys()
                    .then( keys => {
                        keys.forEach( key => {
                            if ( key !== CACHE_NAME && key.match('RestaurantReviews_')) {
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
        // console.log(`URL: ${evt.request.url}, LOCATION ORIG: ${location}`);

        try {
            // get form cache first
            const cachedResponse = await caches.match(evt.request);
            if (cachedResponse) {
                // respond with the value in the cache
                // console.log(`Respond with cached response: ${cachedResponse}`);
                return cachedResponse;
            }
            // response not in cache, then respond with network
            const netResponse = await fetch(evt.request);

            // add fetched response to cache
            const request = evt.request;
            const url = new URL(request.url);

            // console.log('...> location url', evt.request.url);
            // console.log('...> request origin', location.origin);
            // event.request.url.match(location.origin)
            
        
            if (evt.request.url.match(location.origin)) {
                // if (url.origin === location.url) {            
                // don't add to cache if origin is not local
                // we'll persist them to indexedDB
                let cache = await caches.open(CACHE_NAME);
                // console.log('$$$ Adding to cache');
                cache.put(evt.request, netResponse.clone());
            }

            return netResponse;
        } catch (error) {
            console.log(`ERROR: ${error}`);
            throw error;
            
        }
    }

    evt.respondWith(getCustomResponsePromise());
});