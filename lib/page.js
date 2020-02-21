const wtf = require('wtf_wikipedia');
const _ = require('golgoth/lib/_');

/**
 * Page instance
 * @param {string} pageName Name of the page, as written in the url
 * @param {string} raw Raw source content of the page
 * @returns {object} Page object
 **/
module.exports = function(pageName, raw) {
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
    infobox(templateName = 'infobox') {
      const infobox = this.doc().templates(templateName)[0];
      return _.omit(infobox, 'template');
    },
    /**
     * Returns all templates matching the optional selector
     * @param {number|string|RegExp} selector Empty, index, string or regexp to match with templates
     * @returns {object|Array} One or many templates
     **/
    templates(selector) {
      // If not a regexp, we simply forward to the doc
      if (!_.isRegExp(selector)) {
        return this.doc().templates(selector);
      }

      // If regexp, we do string matching on the template nakomes
      const regexp = new RegExp(selector, 'i');
      const allTemplates = this.doc().templates();
      return _.filter(allTemplates, template => {
        return regexp.test(template.template);
      });
    },
    /**
     * Returns all sections matching the optional selector
     * @param {number|string|RegExp} selector Empty, index, string or regexp to match with templates
     * @returns {object|Array} One or many sections
     **/
    sections(selector) {
      // If not a regexp, we simply forward to the doc
      if (!_.isRegExp(selector)) {
        return this.doc().sections(selector);
      }

      // If regexp, we do string matching on the template nakomes
      const regexp = new RegExp(selector, 'i');
      const allSections = this.doc().sections();
      return _.filter(allSections, section => {
        return regexp.test(section._title);
      });
    },
    __wtf: wtf,
  };
};
