const { _extensions } = require('module');
_extensions['.cjs'] = _extensions['.js'];
delete _extensions['.js'];
_extensions['.js'] = _extensions['.cjs'];
