---
Don't read comment in this file, it's for human only.
---

# function library document plan

You have already got a mapping of source file to document file. they are outdated and you need to update them.

You don't need to write document not listed in the mapping.

Not all files in the mapping are valid for document, for example, some files has no exported symbol, a test file, or it's simply not source code, you can skip them.

don't read the README.md file.

# each package

1. walk on each outdated source file, write document for it, and place it at the corresponding document path.
	- if the document is not valuable, for example, it's a test file, or it has no exported symbol, you can skip it, no need to write that file. if the file exists, you can delete it.
1. then, write a `llms.md` file at the root of the package document, with content:
	1. `# Usage`
	1. `<!-- last update: ${current date in YYYY-MM-DD format} -->`
	1. a brief description for entire package in <=200 Chinese characters.
	1. concat all (changed and unchanged) document files:
		1. `<!-- File: {relative path} -->`
		1. document content without header comment
	1. all references link if any

# how to write a document file

Each file will be simple, a small model can handle it.

1. don't read old document content
2. read the source file and it's imported source files. 
	- if it import any library, also read it's document by using context7 or read it's readme.md. but don't read library's source code.
	- if it import a workspace package, don't describe it.
	- try next step without the need to reference non-workspace things, if it's necessary, write a link to it's document, no copy paste.
3. for each exported symbol, and not a simple re-export from other place (exception: if it's a re-export from a private helper, treat it as if it's defined in the main package):
	- explain it's type, usage, and example if possible:
	- ignore types and interfaces used by other exported symbols. (exception: if it's used multiple times, place this type at the bottom)
	- if it's a function, only explain each parameter and return value. the function type itself can be omitted since it's a function.
	- if it's a class, only explain the class itself and it's constructor, not it's members. but write a table of public members with their name and type, with a tiny description no more than 50 Chinese characters.
	- if it's a variable, keep the explanation short, and make a link to it's type definition if applicable. or inline the type definition if it's really small.
