import { _ } from 'golgoth';

/**
 * Parse semantic properties from raw API data
 * @param {Array} raw Raw array from API response (response.query.data)
 * @returns {object} Parsed and cleaned properties object
 **/
export function parseSemanticProperties(raw) {
  // Transform query.data into properties object
  const properties = _.transform(
    raw,
    (result, item) => {
      const { property, dataitem } = item;

      // Skip properties starting with _ and sobj
      if (property.startsWith('_')) {
        return;
      }

      const key = _.camelCase(property);

      // Extract and clean values
      let value = _.map(dataitem, cleanItem);
      if (value.length === 1) {
        value = value[0];
      }

      result[key] = value;
    },
    {},
  );

  return properties;
}

/**
 * Clean value: remove #XX## suffixes and MD5 hashes
 * @param {object} input Value to clean
 * @returns {*} Cleaned value
 **/
function cleanItem(input) {
  const { item } = input;
  if (!_.isString(item)) {
    return item;
  }
  // Remove #digits## pattern (e.g., #0##, #14##, #128##) and everything after
  return item.replace(/#\d+##.*$/, '');
}
