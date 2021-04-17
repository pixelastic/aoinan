---
title: Page methods
---

Once `aoinan` is initialized, you can query any page by passing its title to
`aoinan.page`. This will return an instance of an `aoinan` Page

```javascript
const scenario = await aoinan.page('The Burden of Envy');
```

## infobox

Returns data from the infobox as a JavaScript object. If your target website
uses a custom infobox format (most do), you can pass the name of the template
used for the infobox as argument.

```javascript
// Default infobox
scenario.infobox()

// Custom infobox using a template
scenario.infobox('Adventure')

// Custom infobox using a template, matched by regexp
scenario.infobox(/Adventure/)
```

## templates

Returns an array of all templates used in the page, along with data passed to
each array. You can filter on specific templates by passing a name or regexp as
argument.

```javascript
// All templates
scenario.templates();

// Templates of type "Adventure overview"
scenario.templates('Adventure overview');

// Templates with a name starting with "Adventure"
scenario.templates(/^Adventure/);
```

## sections

Returns an array of all the page sections (separated by titles), with the
textual content of each. You can filter on specific sections by passing a name
or regexp as argument.

```javascript
// All sections
scenario.sections();

// Section named Factions
scenario.sections('Factions');

// Templates with a name starting with "Season"
scenario.sections(/^Season/);
```
