---
title: Initialization
---

Before using `aoinan`, you need to tell it more about the server it needs to
connect to.

By default, MediaWiki servers expose an API endpoint that can be used to query
raw data for any page of the wiki. Note that some hosts might rename (or even
remove) that endpoint.

```javascript
const aoinan = require('aoinan');
aoinan.init({
  server: 'pathfinderwiki.com',
  path: '/mediawiki',
  cacheLocation: './tmp',
});
```

| option          | description                                     | Default value |
| --------------- | ----------------------------------------------- | ------------- |
| `server`        | Root URL to the server hosting the wiki         | N/A           |
| `path`          | Path (relative to `server`) to the API endpoint | N/A           |
| `cacheLocation` | Local path to save API responses                | `./tmp/cache` |

Once this call is done, you can call `aoinan.page` and `aoinan.category`.

## cacheLocation

On first call, a copy of the pages will be downloaded in your `cacheLocation`
folder. Subsequent calls will read value from this cache instead of hitting the
MediaWiki API.

If you need to clear your cache, delete your `cacheLocation` folder.
