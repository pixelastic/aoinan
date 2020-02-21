import Nodemw from 'nodemw';
import Page from './page.js';
import path from 'path';
import firost from 'firost';
import _ from 'golgoth/lib/_';
import pify from 'golgoth/lib/pify';
import pMap from 'golgoth/lib/pMap';

export default {
  nodemw: null,
  cacheLocation: null,
  init(userOptions) {
    const options = {
      cacheLocation: path.resolve('./tmp/cache'),
      ...userOptions,
    };
    this.cacheLocation = options.cacheLocation;
    const nodemwOptions = {
      path: options.path,
      port: options.port,
      server: options.server,
    };
    this.nodemw = new Nodemw(nodemwOptions);
  },
  /**
   * Convert a page title to its url
   * @param {string} title Page title
   * @returns {string} Page slug
   **/
  slug(title) {
    return _.chain(title)
      .replace(/ /g, '_')
      .replace(/'/g, '%27')
      .value();
  },
  /**
   * Query the API and return a custom Page instance
   * @param {string} pageName Name of the page
   * @returns {object} Custom Page object
   **/
  async page(pageName) {
    // Read raw content from cache
    const cachePath = path.resolve(this.cacheLocation, pageName);
    if (await firost.exist(cachePath)) {
      const raw = await firost.read(cachePath);
      return new Page(pageName, raw);
    }

    const getArticle = pify(this.nodemw.getArticle.bind(this.nodemw));
    const raw = await getArticle(pageName);
    await firost.write(raw, cachePath);
    return new Page(pageName, raw);
  },
  async category(categoryName) {
    let pageNames = null;

    // Read from cache
    const cachePath = path.resolve(
      this.cacheLocation,
      `Category:${categoryName}.json`
    );
    if (await firost.exist(cachePath)) {
      pageNames = await firost.readJson(cachePath);
    } else {
      const getPagesInCategory = pify(
        this.nodemw.getPagesInCategory.bind(this.nodemw)
      );
      const raw = await getPagesInCategory(categoryName);
      pageNames = _.map(raw, 'title');
      await firost.writeJson(pageNames, cachePath);
    }

    const allPages = await pMap(pageNames, async pageName => {
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
      {}
    );
  },
};
