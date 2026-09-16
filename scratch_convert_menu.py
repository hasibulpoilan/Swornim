import re
import json

with open('supabase/seed_349_items.sql', 'r', encoding='utf-8') as f:
    text = f.read()

# Pattern to extract ('Item Name', price, 'CATEGORY', sort_order, true)
matches = re.findall(r"\('([^']+)',\s*([0-9.]+)?(?:::numeric)?,\s*'([^']+)'", text)

categories = {}
item_counter = 1
for name, price_str, cat in matches:
    if cat not in categories:
        categories[cat] = []
    price_fmt = f"Rs. {int(float(price_str))}" if price_str and price_str != 'None' else None
    item_id = f"item_{item_counter}"
    item_counter += 1
    item_obj = {"id": item_id, "name": name}
    if price_fmt:
        item_obj["price"] = price_fmt
    categories[cat].append(item_obj)

menu_categories = []
for cat, items in categories.items():
    menu_categories.append({"category": cat, "items": items})

ts_code = "import type { MenuCategory } from '../types'\n\nexport const MENU: MenuCategory[] = " + json.dumps(menu_categories, indent=2) + "\n\n/** WhatsApp number with country code, digits only. */\nexport const WHATSAPP_NUMBER = '918240017974'\n"

with open('src/data/menu.ts', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print(f"Successfully updated src/data/menu.ts with {len(matches)} items across {len(categories)} categories!")
