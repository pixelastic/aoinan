import { emptyDir, read, readJson, write, writeJson } from 'firost';

import current from '../main.js';
import serverHelper from '../test-helpers/server.js';

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
      protocol: 'http',
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

      const actual = await read(`${current.cacheLocation}/pages/Foo.wiki`);

      expect(actual).toEqual('Foo content');
    });
    it('should read from cache if exists', async () => {
      await write('cache', `${current.cacheLocation}/pages/Foo.wiki`);

      const actual = await current.page('Foo');

      expect(actual).toHaveProperty('name', 'Foo');
      expect(actual).toHaveProperty('raw', 'cache');
    });
  });
  describe('semanticProperties', () => {
    it('should fetch, parse and return semantic properties', async () => {
      const actual = await current.semanticProperties('Facts:Among the Living');

      expect(actual).toEqual(
        expect.objectContaining({
          name: 'Among the Living',
          bookType: 'Pathfinder Society scenario',
          pubcode: 'PZOPSS0007E',
          artist: ['Adam_Vehige', 'Rob_Lazzaretti'],
          fullTitle: 'Pathfinder Society Scenario #7: Among the Living',
        }),
      );
    });
    it('should write to cache on first call', async () => {
      const pageName = 'Facts:Among the Living';
      await current.semanticProperties(pageName);

      const actual = await readJson(
        `${current.cacheLocation}/semanticProperties/factsAmongTheLiving.json`,
      );

      expect(actual.length).not.toEqual(0);
    });
    it('should read from cache if exists', async () => {
      const pageName = 'Facts:Among the Living';
      await writeJson(
        {
          query: {
            data: [
              {
                property: 'name',
                dataitem: [{ item: 'cache' }],
              },
            ],
          },
        },
        `${current.cacheLocation}/semanticProperties/factsAmongTheLiving.json`,
      );

      const actual = await current.semanticProperties(pageName);

      expect(actual).toHaveProperty('name', 'cache');
    });
  });
});
