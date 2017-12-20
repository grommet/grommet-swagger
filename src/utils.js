
export const getRef = (data, path) => {
  const parts = path.split('/');
  let node = data;
  while (parts.length) {
    const element = parts.shift();
    if (element === '#') {
      node = data;
    } else {
      node = node[element];
    }
  }
  return node;
};

export const definitionToJson = (data, def, visited = {}) => {
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
  }
  return definition.type;
};

export const searchString = obj =>
  Object.keys(obj).map(name => `${name}=${encodeURIComponent(obj[name])}`).join('&');
