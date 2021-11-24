import gulp from 'gulp';
import api from '@build-script/builder';
import { dirname } from 'path';
api.loadToGulp(gulp, dirname(import.meta.url));
