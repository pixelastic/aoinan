import path from 'node:path';

import { _, pMap, pify } from 'golgoth';
import Nodemw from 'nodemw';

import {
  absolute,
  exists,
  firostError,
  read,
  readJson,
  write,
  writeJson,
} from 'firost';
import Page from './page.js';
import { parseSemanticProperties } from './semanticProperties.js';

export default {
  nodemw: null,
  cacheLocation: null,
  init(userOptions) {
    const options = {
      cacheLocation: absolute('<gitRoot>/tmp/cache'),
      ...userOptions,
    };
    this.cacheLocation = options.cacheLocation;
    const nodemwOptions = {
      path: options.path,
      port: options.port,
      server: options.server,
      protocol: options.protocol,
    };
    this.nodemw = new Nodemw(nodemwOptions);
  },
  /**
   * Convert a page title to its url
   * @param {string} title Page title
   * @returns {string} Page slug
   **/
  slug(title) {
    return _.chain(title).replace(/ /g, '_').replace(/'/g, '%27').value();
  },
  /**
   * Query the API and return a custom Page instance
   * @param {string} pageName Name of the page
   * @returns {object} Custom Page object
   **/
  async page(pageName) {
    // Read raw content from cache
    const cachePath = path.resolve(
      this.cacheLocation,
      'pages',
      `${pageName}.wiki`,
    );

    if (await exists(cachePath)) {
      const raw = await read(cachePath);
      return new Page(pageName, raw);
    }

    const getArticle = pify(this.nodemw.getArticle.bind(this.nodemw));
    const raw = await getArticle(pageName);
    await write(raw, cachePath);
    return new Page(pageName, raw);
  },
  async category(categoryName) {
    let pageNames = null;

    // Read from cache
    const cachePath = path.resolve(
      this.cacheLocation,
      `Category:${categoryName}.json`,
    );
    if (await exists(cachePath)) {
      pageNames = await readJson(cachePath);
    } else {
      const getPagesInCategory = pify(
        this.nodemw.getPagesInCategory.bind(this.nodemw),
      );

      try {
        const raw = await getPagesInCategory(categoryName);
        pageNames = _.map(raw, 'title');
        await writeJson(pageNames, cachePath);
      } catch (err) {
        console.error(err);
        throw firostError(
          'ERROR_PAGES_IN_CATEGORY',
          `Can't get all pages in the category ${categoryName}. Check that the name is correct and the API is open.`,
        );
      }
    }

    const allPages = await pMap(pageNames, async (pageName) => {
      return {
        pageName,
        pageData: await this.page(pageName),
      };
    });

    return _.transform(
      allPages,
      (result, value) => {
        result[value.pageName] = value.pageData;
      },
      {},
    );
  },
  /**
   * Get semantic properties for a page
   * @param {string} pageName Name of the page
   * @returns {object} Semantic properties with data arrays and sobj
   **/
  async semanticProperties(pageName) {
    // Read from cache
    const pageSlug = _.camelCase(pageName);
    const cachePath = path.resolve(
      this.cacheLocation,
      'semanticProperties',
      `${pageSlug}.json`,
    );

    if (await exists(cachePath)) {
      const response = await readJson(cachePath);
      return parseSemanticProperties(response.query.data);
    }

    // Call API via nodemw
    // Note: nodemw api.call callback receives (err, info, next, data)
    // where info = data[actionName]. For browsebysubject, data is under data.query,
    // so we need to use multiArgs to get all callback parameters
    const browseBySubject = pify(this.nodemw.api.call.bind(this.nodemw.api), {
      multiArgs: true,
    });

    const [_info, _next, response] = await browseBySubject({
      action: 'browsebysubject',
      subject: pageName,
      format: 'json',
    });

    // Save raw API response to cache
    await writeJson(response, cachePath);

    return parseSemanticProperties(response.query.data);
  },
};
