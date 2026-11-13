"""Build src/lib/commands.json from the drew-docs command reference.

Usage: python3 scripts/gen-commands.py ../drew-docs/commands
"""
import json, re, sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else "../drew-docs/commands")
out = Path(__file__).resolve().parent.parent / "src/lib/commands.json"
strip = lambda s: re.sub(r"\*\*|`", "", s).strip()

cats = []
for f in sorted(src.glob("*.md")):
    if f.stem == "overview":
        continue
    text = f.read_text()
    fm = dict(re.findall(r"^(\w+): (.+)$", text.split("---")[1], re.M))
    body = text.split("---", 2)[2]
    head, *sections = re.split(r"^## (?=/)", body, flags=re.M)
    intro = [l for l in head.splitlines() if l and not l.startswith(("#", "!!!", "-", "|"))]
    notes = [strip(l[2:]) for l in head.splitlines() if l.startswith("- ")]
    cmds = []
    for sec in sections:
        lines = sec.splitlines()
        name = lines[0].strip()
        paras = [l for l in lines[1:] if l and not l.startswith(("|", "#", "!!!"))]
        opts = []
        for l in lines:
            m = re.match(r"^\| `([^`]+)` \| ([^|]+) \| ([^|]+) \| (.*) \|$", l)
            if m:
                opts.append({"name": m[1], "type": m[2].strip(), "required": m[3].strip() == "Yes", "description": strip(m[4])})
        cmds.append({"name": name, "description": strip(paras[0]) if paras else "", "notes": [strip(p) for p in paras[1:]], "options": opts})
    cats.append({"id": f.stem, "label": fm.get("label", f.stem), "order": int(fm.get("order", 0)), "intro": strip(intro[0]) if intro else "", "notes": notes, "commands": cmds})

cats.sort(key=lambda c: -c["order"])
out.write_text(json.dumps(cats, indent=1, ensure_ascii=False) + "\n")
print(f"{sum(len(c['commands']) for c in cats)} commands in {len(cats)} categories -> {out}")
