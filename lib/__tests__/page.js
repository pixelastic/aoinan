const Page = jestImport('../page');
const objectWith = expect.objectContaining;

describe('Page', () => {
  describe('new Page()', () => {
    it('should set the name and raw content', () => {
      const actual = new Page('Foo', 'foo');
      expect(actual).toHaveProperty('name', 'Foo');
      expect(actual).toHaveProperty('raw', 'foo');
    });
  });
  describe('doc()', () => {
    it('should return a doc instance', () => {
      const input = new Page('Foo', 'foo');

      const actual = input.doc();
      expect(actual.constructor.name).toEqual('Document');
    });
    it('should use cached value on subsequent calls', () => {
      const input = new Page('Foo', 'foo');
      jest.spyOn(input, '__wtf');

      input.doc();
      input.doc();

      expect(input.__wtf).toHaveBeenCalledTimes(1);
    });
  });
  describe('infobox()', () => {
    it('should return a keyed object', () => {
      const input = '{{Infobox | foo = bar }}';
      const page = new Page('Foo', input);

      const actual = page.infobox();

      expect(actual).toHaveProperty('foo', 'bar');
    });
    it('should allow specifying another infobox template name', () => {
      const input = '{{Adventure | foo = bar }}';
      const page = new Page('Foo', input);

      const actual = page.infobox('adventure');

      expect(actual).toHaveProperty('foo', 'bar');
    });
    it('should exclude the template key', () => {
      const input = '{{Infobox | foo = bar }}';
      const page = new Page('Foo', input);

      const actual = page.infobox();

      expect(actual).not.toHaveProperty('template');
    });
  });
  describe('templates()', () => {
    it('should return all templates if no name specified', () => {
      const input = '{{Foo}}{{Bar}}{{Baz}}';
      const page = new Page('Foo', input);

      const actual = page.templates();

      expect(actual).toBeArrayOfSize(3);
      expect(actual).toContainEqual(objectWith({ template: 'foo' }));
      expect(actual).toContainEqual(objectWith({ template: 'bar' }));
      expect(actual).toContainEqual(objectWith({ template: 'baz' }));
    });
    it('should return templates by name', () => {
      const input = '{{Foo}}{{Bar}}{{Baz}}';
      const page = new Page('Foo', input);

      const actual = page.templates('Bar');
      expect(actual).toBeArrayOfSize(1);
      expect(actual).toContainEqual(objectWith({ template: 'bar' }));
    });
    it('should return template by index', () => {
      const input = '{{Foo}}{{Bar}}{{Baz}}';
      const page = new Page('Foo', input);

      const actual = page.templates('Baz');
      expect(actual).toBeArrayOfSize(1);
      expect(actual).toContainEqual(objectWith({ template: 'baz' }));
    });
    it('should return templates by regexp', () => {
      const input = '{{Foo}}{{Bar}}{{Baz}}';
      const page = new Page('Foo', input);

      const actual = page.templates(/^Ba/);
      expect(actual).toBeArrayOfSize(2);
      expect(actual).toContainEqual(objectWith({ template: 'bar' }));
      expect(actual).toContainEqual(objectWith({ template: 'baz' }));
    });
  });
  describe('sections()', () => {
    it('should return all sections if no name specified', () => {
      const input = '==Foo== foo \n==Bar== bar \n==Baz== baz';
      const page = new Page('Foo', input);

      const actual = page.sections();

      expect(actual[0].constructor.name).toEqual('Section');
      expect(actual[0]).toHaveProperty('_title', 'Foo');
      expect(actual[1]).toHaveProperty('_title', 'Bar');
      expect(actual[2]).toHaveProperty('_title', 'Baz');
    });
    it('should return sections by name', () => {
      const input = '==Foo== foo \n==Bar== bar \n==Baz== baz';
      const page = new Page('Foo', input);

      const actual = page.sections('Bar');

      expect(actual).toHaveProperty('_title', 'Bar');
    });
    it('should return sections by index', () => {
      const input = '==Foo== foo \n==Bar== bar \n==Baz== baz';
      const page = new Page('Foo', input);

      const actual = page.sections(2);

      expect(actual).toHaveProperty('_title', 'Baz');
    });
    it('should return sections by regexp', () => {
      const input = '==Foo== foo \n==Bar== bar \n==Baz== baz';
      const page = new Page('Foo', input);

      const actual = page.sections(/^Ba/);
      expect(actual[0]).toHaveProperty('_title', 'Bar');
      expect(actual[1]).toHaveProperty('_title', 'Baz');
    });
  });
});
