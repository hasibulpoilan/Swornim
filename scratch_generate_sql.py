import json

with open("scratch_final_349_catalog.json", "r", encoding="utf-8") as f:
    catalog = json.load(f)

sql_lines = []
sql_lines.append("-- Seed all 349 menu items across 9 categories into public.products")
sql_lines.append("truncate table public.products;")
sql_lines.append("")
sql_lines.append("insert into public.products (name, price, category, sort_order, is_visible) values")

values_parts = []
sort_order = 1

for cat_name, items in catalog.items():
    for item in items:
        name_esc = item['name'].replace("'", "''")
        price_val = f"{item['price']}::numeric" if item['price'] is not None else "null::numeric"
        cat_esc = cat_name.replace("'", "''")
        values_parts.append(f"  ('{name_esc}', {price_val}, '{cat_esc}', {sort_order}, true)")
        sort_order += 1

sql_lines.append(",\n".join(values_parts) + ";")

sql_content = "\n".join(sql_lines)

with open("supabase/seed_349_items.sql", "w", encoding="utf-8") as f:
    f.write(sql_content)

print(f"Generated supabase/seed_349_items.sql with {sort_order - 1} items.")
