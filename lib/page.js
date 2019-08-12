import wtf from 'wtf_wikipedia';
import { _ } from 'golgoth';

export default function(pageName, raw) {
  const doc = wtf(raw);
  return {
    raw() {
      return raw;
    },
    doc() {
      return doc;
    },
    html() {
      return doc.html();
    },
    text() {
      return doc.text();
    },
    dom() {},
    tree() {
      return doc.json();
    },
    infobox(templateName = 'infobox') {
      const infobox = doc.templates(templateName)[0];
      return _.omit(infobox, 'template');
    },
    templates(templateName) {
      return doc.templates(templateName);
    },
  };
}
