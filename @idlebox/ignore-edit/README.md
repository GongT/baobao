# Structured Ignore Files

library to parse/modify ignore files like this:

```ignorefile
### dist files
/dist

### packages
node_modules

### logs
*.log

### temp folders
temp/
/generated-files
*.temp
```

```ts
import { loadFile, saveFile } from '@idlebox/ignore-edit';
const content = loadFile('.gitignore');

content.packages.push('jspm_packages');

content['new section'].push('some/folder');

content['temp folders'].delete('temp/');
content['temp folders'].push('!wanted.temp');

saveFile(content);
```
