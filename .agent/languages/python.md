## indexing

You must write and maintain `__all__` variable in `__init__.py`, only list symbols should be exported.

## comment

Comment rules can be relaxed for Python files, since it's weakly typed and statement can chaind too long. for example:

```python
# good: very long statement may explain by a short comment
x = [i * 2 if i % 2 == 0 and i > 5 else i for i in range(10)] # 这个是做xxxx用的
```
