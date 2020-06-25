const current = require('../main');
const serverHelper = require('../test-helpers/server.js');
const emptyDir = require('firost/lib/emptyDir');
const read = require('firost/lib/read');
const write = require('firost/lib/write');

describe('aoinan', () => {
  let serverStarted = false;
  let serverUrl;
  beforeEach(async () => {
    if (serverStarted) {
      return;
    }

    serverStarted = true;
    serverUrl = await serverHelper.start('./fixtures');
    const [server, port] = serverUrl.replace('http://', '').split(':');
    current.init({
      server,
      port,
      path: '/wiki',
    });
    await emptyDir(current.cacheLocation);
  });
  afterAll(() => {
    serverHelper.stop();
  });
  describe('slug', () => {
    it('Carsomyr', () => {
      const actual = current.slug('Carsomyr');

      expect(actual).toEqual('Carsomyr');
    });
    it('Larder Door', () => {
      const actual = current.slug('Larder Door');

      expect(actual).toEqual('Larder_Door');
    });
    it('Last Blade of the White Forge', () => {
      const actual = current.slug('Last Blade of the White Forge');

      expect(actual).toEqual('Last_Blade_of_the_White_Forge');
    });
    it("Lilith's Shawl", () => {
      const actual = current.slug("Lilith's Shawl");

      expect(actual).toEqual('Lilith%27s_Shawl');
    });
    it("Exarch Lord Sserkal's's head", () => {
      const actual = current.slug("Exarch Lord Sserkal's's head");

      expect(actual).toEqual('Exarch_Lord_Sserkal%27s%27s_head');
    });
  });
  describe('page', () => {
    it('should return a page instance with title and raw content', async () => {
      const actual = await current.page('Foo');

      expect(actual).toHaveProperty('name', 'Foo');
      expect(actual).toHaveProperty('raw', 'Foo content');
    });
    it('should write to cache on first call', async () => {
      await current.page('Foo');

      const actual = await read(`${current.cacheLocation}/Foo`);

      expect(actual).toEqual('Foo content');
    });
    it('should read from cache if exists', async () => {
      await write('cache', `${current.cacheLocation}/Foo`);

      const actual = await current.page('Foo');

      expect(actual).toHaveProperty('name', 'Foo');
      expect(actual).toHaveProperty('raw', 'cache');
    });
  });
});
