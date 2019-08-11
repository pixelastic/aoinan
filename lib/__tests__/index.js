import module from '../index';
import helper from '../test-helper';

describe('aoi', () => {
  let serverUrl = null;
  beforeEach(async () => {
    if (serverUrl) {
      return;
    }
    serverUrl = await helper.startServer('./fixtures');
    const [server, port] = serverUrl.replace('http://', '').split(':');
    module.init({
      server,
      port,
      path: '/wiki',
    });
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
  describe('pagesFromCategory', () => {
    it('should return all page names', async () => {
      const actual = await module.pagesFromCategory('Alpha');

      expect(actual).toContain('One');
      expect(actual).toContain('Two');
      expect(actual).toContain('Three');
    });
  });
});
