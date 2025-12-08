import { absolute, readJson } from 'firost';

import { parseSemanticProperties } from '../semanticProperties.js';

it('parseSemanticProperties', async () => {
  const fixturePath = absolute(
    '<packageRoot>/fixtures/semanticProperties/Facts_Among_the_Living.json',
  );
  const rawData = await readJson(fixturePath);
  const actual = parseSemanticProperties(rawData);
  expect(actual).toEqual(
    expect.objectContaining({
      name: 'Among the Living',
      bookType: 'Pathfinder Society scenario',
      pubcode: 'PZOPSS0007E',
      artist: ['Adam_Vehige', 'Rob_Lazzaretti'],
      fullTitle: 'Pathfinder Society Scenario #7: Among the Living',
    }),
  );

  expect(actual).not.toHaveProperty('_SKEY');
});
