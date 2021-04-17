const wtf = require('wtf_wikipedia');
const wtfPluginHtml = require('wtf-plugin-html');
wtf.plugin(wtfPluginHtml);
const _ = require('golgoth/_');

/**
 * Page instance
 * @param {string} pageName Name of the page, as written in the url
 * @param {string} raw Raw source content of the page
 * @returns {object} Page object
 **/
module.exports = function (pageName, raw) {
  return {
    name: pageName,
    raw,
    /**
     * Returns a lazy-loaded wtf document instance
     * Uses cache on subsequent calls
     * @returns {object} wtf doc instance
     **/
    __doc: null,
    doc() {
      if (!this.__doc) {
        this.__doc = this.__wtf(this.raw);
      }
      return this.__doc;
    },
    /**
     * Return an object representin the infobox
     * @param {string} templateName Optional name of the Infobox template
     * @returns {object} Infobox as an object
     **/
    infobox(templateName) {
      // Found as a default infobox directly
      if (!templateName) {
        const infobox = this.doc().infobox();
        return _.transform(
          infobox.json(),
          (result, value, key) => {
            result[key] = value.text;
          },
          {}
        );
      }

      // Found as a custom template
      const infobox = this.templates(templateName)[0];
      return _.omit(infobox, 'template');
    },
    /**
     * Returns all templates matching the optional selector
     * @param {number|string|RegExp} selector Empty, index, string or regexp to match with templates
     * @returns {object|Array} One or many templates
     **/
    templates(selector) {
      const allTemplates = this.doc().templates();

      return _.chain(allTemplates)
        .map((template) => {
          return template.json();
        })
        .filter((template) => {
          const isRegExp = _.isRegExp(selector);
          const templateName = template.template;

          // Filter by regexp
          if (isRegExp) {
            const regexp = new RegExp(selector, 'i');
            return regexp.test(template.template);
          }
          // Filter by name
          if (selector) {
            return _.lowerCase(selector) === templateName;
          }
          // No filter
          return template;
        })
        .value();
    },
    /**
     * Returns all sections matching the optional selector
     * @param {number|string|RegExp} selector Empty, index, string or regexp to match with templates
     * @returns {object|Array} One or many sections
     **/
    sections(selector) {
      const allSections = this.doc().sections();
      const isRegExp = _.isRegExp(selector);

      return _.chain(allSections)
        .map((section) => {
          const rawJson = section.json();
          const { title } = rawJson;
          const content = _.chain(rawJson)
            .get('paragraphs', [])
            .map(({ sentences }) => {
              return _.chain(sentences).map('text').join(' ').value();
            })
            .value();
          return {
            title,
            content,
          };
        })
        .filter((section) => {
          const { title } = section;

          // Filter by regexp
          if (isRegExp) {
            const regexp = new RegExp(selector, 'i');
            return regexp.test(title);
          }
          // Filter by name
          if (selector) {
            return selector === title;
          }
          // No filter
          return section;
        })
        .value();
      // const
      // // If not a regexp, we simply forward to the doc
      // if (!_.isRegExp(selector)) {
      //   return this.doc().sections(selector);
      // }

      // // If regexp, we do string matching on the template nakomes
      // const regexp = new RegExp(selector, 'i');
      // const allSections = this.doc().sections();
      // return _.filter(allSections, (section) => {
      //   return regexp.test(section._title);
      // });
    },
    __wtf: wtf,
  };
};
