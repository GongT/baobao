# Auto manage extensions

After install this extension, all installed (and further install) extensions will be disabled, you can set `extensions.alwaysEnable` in your `settings.json` to exclude some.

Every time you open a folder/workspace with `.vscode/extensions.json`:

-   extensions in `recommendations` will be enabled
-   extensions in `unwantedRecommendations` will be disabled (even they are in alwaysEnable list)

This is done by call other extension's `activate()` api, some extension may not work in this way.
