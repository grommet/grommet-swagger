
export const getRef = (data, path) => {
  const parts = path.split('/');
  let node = data;
  while (parts.length) {
    const element = parts.shift();
    if (element === '#') {
      node = data;
    } else if (node[element]) {
      node = node[element];
    }
  }
  return node;
};

export const definitionToJson = (data, def, visited = {}) => {
  if (!def) {
    return undefined;
  }

  // avoid endless recursion
  const nextVisited = { ...visited };
  if (def.$ref) {
    if (visited[def.$ref]) {
      return def.$ref;
    }
    nextVisited[def.$ref] = true;
  }

  const definition = def.$ref ? getRef(data, def.$ref) : def;
  if (definition.type === 'array') {
    return [definitionToJson(data, definition.items, nextVisited)];
  } else if (definition.properties) {
    const result = {};
    Object.keys(definition.properties).forEach((name) => {
      result[name] = definitionToJson(data, definition.properties[name], nextVisited);
    });
    return result;
  } else if (definition.enum) {
    return definition.enum.join('|');
  } else if (definition.type) {
    return definition.type;
  }
  return definition;
};

export const filterHidden = paths =>
  Object.keys(paths).reduce((visibleDefs, path) => {
    const visibleRoutes = Object.keys(paths[path]).filter(method => !paths[path][method].tags || !paths[path][method].tags.includes('hidden'));
    return {
      ...visibleDefs,
      ...visibleRoutes.length ? {
        [path]: visibleRoutes.reduce((methods, method) =>
          ({ ...methods, [method]: paths[path][method] }), {}),
      } : {},
    };
  }, {});

export const filterHiddenPaths = data => ({ ...data, paths: filterHidden(data.paths) });

export const searchString = obj =>
  Object.keys(obj).map(name => `${name}=${encodeURIComponent(obj[name])}`).join('&');

export const sanitizeForMarkdown = (stringForMd) => {
  if (!stringForMd) {
    return '';
  }
  let mdStringWithBreaks = stringForMd.replace(new RegExp('</BR>', 'gi'), '\n\n');
  mdStringWithBreaks = mdStringWithBreaks.replace(new RegExp('\\n\\n', 'gi'), ' \n\n ');
  const mdArray = mdStringWithBreaks.split(' ');
  const cleanMdArray = mdArray.map((md) => {
    // Avoid errors in situations like this - '_this should all style_, rest of the string...'
    const actualString = md.replace(new RegExp('[.,]', 'g'), '');
    if (actualString.indexOf('_') > 1 && actualString.indexOf('_') !== actualString.length - 1) {
      // This is an underscore that is not preceeded by a space and should not be em styled.
      return md.replace(new RegExp('_', 'gi'), '\\_');
    }
    return md;
  });
  return cleanMdArray.join(' ');
};
