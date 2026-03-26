#/bin/bash

git clean -ndX | grep -vF node_modules/ | grep -vF local-history | sed 's#Would remove ##g' | xargs -n5 -t rm -rf
