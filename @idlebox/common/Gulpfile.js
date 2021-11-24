import gulp from 'gulp';
import { loadToGulp } from '@build-script/builder';
import { dirname } from 'path';
loadToGulp(gulp, dirname(import.meta.url));
