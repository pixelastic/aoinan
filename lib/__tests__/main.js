const module = jestImport('../main');
const helper = jestImport('../test-helper');
const emptyDir = jestImport('firost/lib/emptyDir');
const read = jestImport('firost/lib/read');
const write = jestImport('firost/lib/write');

describe('aoi', () => {
  let serverStarted = false;
  let serverUrl;
  beforeEach(async () => {
    await emptyDir(module.cacheLocation);
    if (serverStarted) {
      return;
    }

    serverStarted = true;
    serverUrl = await helper.startServer('./fixtures');
    const [server, port] = serverUrl.replace('http://', '').split(':');
    module.init({
      server,
      port,
      path: '/wiki',
    });
    await emptyDir(module.cacheLocation);
  });
  afterAll(() => {
    helper.closeServer();
  });
  describe('slug', () => {
    it('Carsomyr', () => {
      const actual = module.slug('Carsomyr');

      expect(actual).toEqual('Carsomyr');
    });
    it('Larder Door', () => {
      const actual = module.slug('Larder Door');

      expect(actual).toEqual('Larder_Door');
    });
    it('Last Blade of the White Forge', () => {
      const actual = module.slug('Last Blade of the White Forge');

      expect(actual).toEqual('Last_Blade_of_the_White_Forge');
    });
    it("Lilith's Shawl", () => {
      const actual = module.slug("Lilith's Shawl");

      expect(actual).toEqual('Lilith%27s_Shawl');
    });
    it("Exarch Lord Sserkal's's head", () => {
      const actual = module.slug("Exarch Lord Sserkal's's head");

      expect(actual).toEqual('Exarch_Lord_Sserkal%27s%27s_head');
    });
  });
  describe('page', () => {
    it('should return a page instance with title and raw content', async () => {
      const actual = await module.page('Foo');

      expect(actual).toHaveProperty('name', 'Foo');
      expect(actual).toHaveProperty('raw', 'Foo content');
    });
    it('should write to cache on first call', async () => {
      await module.page('Foo');

      const actual = await read(`${module.cacheLocation}/Foo`);

      expect(actual).toEqual('Foo content');
    });
    it('should read from cache if exists', async () => {
      await write('cache', `${module.cacheLocation}/Foo`);

      const actual = await module.page('Foo');

      expect(actual).toHaveProperty('name', 'Foo');
      expect(actual).toHaveProperty('raw', 'cache');
    });
  });
});
