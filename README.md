# grommet-swagger
Swagger API browser built using grommet

# Installation

```
npm install grommet-swagger
```

# Using

You can run this directly from an HTML file via something like:

```
<html>
<head>
  <script>
    function render() {
      window.GrommetSwagger.mount('content', {
        routePrefix: '/grommet-swagger'
      });
    }
  </script>
</head>
<body>
  <div id="content"></div>
  <script src="grommet-swagger.min.js" onload="render()"></script>
</body>
</html>
```

Or, you can use Javascript/React:

```
import { GrommetSwagger } from 'grommet-swagger';

const Root = () => (
  <GrommetSwagger />
);
```
