# section disk buffer

Cache multi-threaded download sections, write to disk every N mb.

Only do continues write on two big files, prevent create too many framents.
