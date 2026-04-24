# Hello, world

First post on this new blog. The site is a Nintendo DS Lite-themed portfolio — green on black, pixel fonts, dual-screen layout. This is the space where I'll write up things in longer form.

## What I'll post here

- CTF writeups (after solve windows close)
- Notes from vulnerability research — QuickJS-NG, WASM3, and whatever else I end up poking at
- Occasional rambles on cryptography, pixel art, and anything else that seems worth writing down

## Markdown support

The rendering is vanilla `marked` — headings, lists, links, code, blockquotes, tables, and images all work.

### Code blocks

```python
def xor(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))
```

### A link

Find me on [CryptoHack](https://cryptohack.org/user/poppet_t/) or [GitHub](https://github.com/poppet-t).

### A quote

> "The enemy knows the system." — Kerckhoffs

That's it for now. More soon.
