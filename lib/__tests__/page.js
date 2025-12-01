import Page from '../page.js';

describe('Page', () => {
  describe('new Page()', () => {
    it('should set the name and raw content', () => {
      const actual = new Page('Test page', 'Test content');
      expect(actual).toHaveProperty('name', 'Test page');
      expect(actual).toHaveProperty('raw', 'Test content');
    });
  });
  describe('doc()', () => {
    it('should return a doc instance', () => {
      const input = new Page('Test page', 'Test content');

      const actual = input.doc();
      expect(actual.constructor.name).toEqual('Document');
    });
    it('should use cached value on subsequent calls', () => {
      const input = new Page('Test page', 'Test content');
      vi.spyOn(input, '__wtf');

      input.doc();
      input.doc();

      expect(input.__wtf).toHaveBeenCalledTimes(1);
    });
  });
  describe('infobox()', () => {
    it.each([
      [
        dedent(`
      {{Infobox basketball club
      | name = Toronto Raptors
      | imagesize = 200px}}
      `),
        { name: 'Toronto Raptors', imagesize: '200px' },
      ],
      ['{{Infobox connextor | name = Tim}}', { name: 'Tim' }],
      [
        dedent(`
        {{Adventure
        | name  = The Burden of Envy}}
        `),
        { name: 'The Burden of Envy' },
        'Adventure',
      ],
    ])('%s', (input, expected, argument = undefined) => {
      const page = new Page('Test page', input);
      const actual = page.infobox(argument);
      expect(actual).toEqual(expected);
    });
  });
  describe('templates()', () => {
    it.each([
      [
        'All templates',
        '{{Stats}}{{Loot}}{{Hook}}',
        [{ template: 'stats' }, { template: 'loot' }, { template: 'hook' }],
      ],
      [
        'Of a given type',
        '{{Stats}}{{Loot}}{{Hook}}',
        [{ template: 'loot' }],
        'Loot',
      ],
      [
        'Several of the same type',
        '{{Stats}}{{Loot | type = Sword}}{{Hook}}{{Loot | type = Hammer}}',
        [
          { template: 'loot', type: 'Sword' },
          { template: 'loot', type: 'Hammer' },
        ],
        'Loot',
      ],
      [
        'Filtering by regexp',
        '{{NPCStats}}{{Loot}}{{MonsterStats}}',
        [{ template: 'npcstats' }, { template: 'monsterstats' }],
        /Stats$/,
      ],
    ])('%s', async (_title, input, expected, argument = undefined) => {
      const page = new Page('Test page', input);
      const actual = page.templates(argument);
      expect(actual).toEqual(expected);
    });
  });
  describe('sections()', () => {
    it.each([
      [
        'All sections',
        '==Hooks== Hooks content \n==Monsters== Monsters content',
        [
          { title: 'Hooks', content: ['Hooks content'] },
          { title: 'Monsters', content: ['Monsters content'] },
        ],
      ],
      [
        'By name',
        '==Hooks== Hooks content \n==Monsters== Monsters content',
        [{ title: 'Hooks', content: ['Hooks content'] }],
        'Hooks',
      ],
      [
        'By regexp',
        '==NPC Stats== NPC Stats content \n==Loot== Loot content\n==Monster Stats== Monster Stats content',
        [
          { title: 'NPC Stats', content: ['NPC Stats content'] },
          {
            title: 'Monster Stats',
            content: ['Monster Stats content'],
          },
        ],
        /Stats$/,
      ],
      [
        'Black Waters',
        dedent`
        == Recurring characters, concepts, & locations ==

        The following characters, concepts, or locations can...

        * [[Deris Marlinchen]] (''[[School of Spirits|#7-05 School of Spirits]]'')
        
        * [[Junia Dacilane]] (''[[School of Spirits|#7-05 School of Spirits]]'')`,
        [
          {
            title: 'Recurring characters, concepts, & locations',
            content: [
              'The following characters, concepts, or locations can...',
              '* Deris Marlinchen (#7-05 School of Spirits)',
              '* Junia Dacilane (#7-05 School of Spirits)',
            ],
          },
        ],
        /Recurring characters/,
      ],
    ])('%s', async (_title, input, expected, argument = undefined) => {
      const page = new Page('Test page', input);
      const actual = page.sections(argument);
      expect(actual).toEqual(expected);
    });
  });
});
